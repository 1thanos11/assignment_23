import { startSession } from "mongoose";
import { CacheTTL } from "../../common/constants/cache.constants.js";
import { BadRequestError, ForbiddenError, NotFoundError, } from "../../common/errors/client.errors.js";
import { InternalServerError } from "../../common/errors/server.errors.js";
import { REPORT_TARGET_MAP } from "../../common/maps/report.target.map.js";
import { redisService } from "../../common/services/redis.service.js";
import { ModerationCaseRepository, ReportRepository, } from "../../infra/repository/index.js";
import { realtimeGateWay } from "../realtime/realtime.gateway.js";
import { ReportPriorityEnum, ReportReasonEnum, ReportStatusEnum, } from "../../common/enums/report.enums.js";
class ReportService {
    reportRepository;
    moderationCaseRepository;
    redis = redisService;
    get realtime() {
        return realtimeGateWay;
    }
    constructor() {
        this.reportRepository = new ReportRepository();
        this.moderationCaseRepository = new ModerationCaseRepository();
    }
    async determinePriorityFromCount(targetId) {
        const count = await this.reportRepository.countDocuments({
            filter: { targetId },
        });
        if (count > 50 && count < 100) {
            return ReportPriorityEnum.MEDIUM;
        }
        if (count > 100 && count < 200) {
            return ReportPriorityEnum.HIGH;
        }
        if (count > 200) {
            return ReportPriorityEnum.CRITICAL;
        }
        else {
            return ReportPriorityEnum.LOW;
        }
    }
    determinePriorityFromReason(reason) {
        switch (reason) {
            case ReportReasonEnum.SPAM:
            case ReportReasonEnum.COPYRIGHT:
                return ReportPriorityEnum.LOW;
            case ReportReasonEnum.NUDITY:
            case ReportReasonEnum.OTHER:
                return ReportPriorityEnum.MEDIUM;
            case ReportReasonEnum.HARASSMENT:
            case ReportReasonEnum.HATE_SPEECH:
            case ReportReasonEnum.SCAM:
            case ReportReasonEnum.IMPERSONATION:
                return ReportPriorityEnum.HIGH;
            case ReportReasonEnum.VIOLENCE:
                return ReportPriorityEnum.CRITICAL;
            default:
                return ReportPriorityEnum.MEDIUM;
        }
    }
    async report(inputs) {
        const { user, targetId, targetType, reason, customReason, snapshot } = inputs;
        if (user._id.equals(targetId)) {
            throw new ForbiddenError(`You can't report yourself`);
        }
        let moderationCase;
        const session = await startSession();
        try {
            await session.withTransaction(async () => {
                const repository = REPORT_TARGET_MAP[targetType];
                if (!repository) {
                    throw new BadRequestError(`Invalid report target type`);
                }
                const targetExist = await repository.findOneAndUpdate({
                    filter: { _id: targetId },
                    update: { $inc: { reportsCount: 1 } },
                    options: { session },
                });
                if (!targetExist) {
                    throw new NotFoundError(`the target report is not exist`);
                }
                const priorityFromCount = await this.determinePriorityFromCount(targetId);
                const priorityFromReason = this.determinePriorityFromReason(reason);
                let priority;
                if (priorityFromCount > priorityFromReason) {
                    priority = priorityFromReason;
                }
                else {
                    priority = priorityFromCount;
                }
                const report = await this.reportRepository.createOne({
                    data: {
                        reporterId: user._id,
                        targetId,
                        targetType,
                        reason,
                        customReason,
                        snapshot,
                    },
                    options: { session },
                });
                if (!report) {
                    throw new InternalServerError(`can't create your report please try again later`);
                }
                moderationCase = await this.moderationCaseRepository.findOne({
                    filter: { targetId },
                    options: { session },
                });
                if (moderationCase) {
                    const moderationCasePriority = moderationCase.priority;
                    moderationCase.priority =
                        moderationCasePriority < priority
                            ? moderationCasePriority
                            : priority;
                    moderationCase.reportsCount += 1;
                    ((moderationCase.lastReason =
                        reason === ReportReasonEnum.OTHER
                            ? customReason
                            : reason),
                        await moderationCase.save({ session }));
                }
                else {
                    moderationCase = await this.moderationCaseRepository.createOne({
                        data: {
                            targetId,
                            targetType,
                            reportsCount: 1,
                            priority,
                            status: ReportStatusEnum.PENDING,
                            lastReason: reason === ReportReasonEnum.OTHER
                                ? customReason
                                : reason,
                        },
                        options: { session },
                    });
                }
            });
        }
        catch (error) {
            throw error;
        }
        finally {
            await session.endSession();
        }
        await this.redis.incrementReportVersion({});
        await this.redis.incrementModerationCaseVersion({
            moderationCaseId: moderationCase._id,
        });
        await this.redis.incrementModerationCaseVersion({});
        const socketIds = await this.redis.getSockets(user._id);
        this.realtime.getIo.to(socketIds).emit("report_user", {
            reporterId: user._id,
            reportedId: targetId,
        });
        return;
    }
    async openReport(inputs) {
        const { reportId } = inputs;
        const version = await this.redis.getReportVersion({ reportId });
        const key = this.redis.reportKey({ reportId, version });
        const report = await this.redis.cache({
            key,
            ttl: CacheTTL.BLOCK_LIST,
            fn: () => this.reportRepository.findOne({
                filter: { _id: reportId },
            }),
        });
        if (!report) {
            throw new NotFoundError(`Report not found`);
        }
        return report;
    }
    async openModerationCase(inputs) {
        const { moderationCaseId } = inputs;
        const version = await this.redis.getModerationCaseVersion({
            moderationCaseId,
        });
        const key = this.redis.moderationCaseKey({ moderationCaseId, version });
        const moderationCase = await this.redis.cache({
            key,
            ttl: CacheTTL.MODERATION_CASE,
            fn: () => this.moderationCaseRepository.findOne({
                filter: { _id: moderationCaseId },
            }),
        });
        if (!moderationCase) {
            throw new NotFoundError(`Moderation case not found`);
        }
        return moderationCase;
    }
    async takeActionForModerationCase(inputs) {
        const { user, moderationCaseId, action, customAction, status } = inputs;
        const moderationCase = await this.moderationCaseRepository.findOneAndUpdate({
            filter: { _id: moderationCaseId },
            update: {
                $set: {
                    actionTaken: action,
                    customAction,
                    status,
                    actorId: user._id,
                },
            },
        });
        if (!moderationCase) {
            throw new NotFoundError(`Moderation case not found`);
        }
        await this.redis.incrementModerationCaseVersion({
            moderationCaseId: moderationCase._id,
        });
        await this.redis.incrementModerationCaseVersion({});
        const socketIds = await this.redis.getSockets(user._id);
        this.realtime.getIo.to(socketIds).emit("take_action_for_moderation_case", {
            actorId: user._id,
            moderationCaseId,
            action,
            customAction,
            status,
        });
        return;
    }
}
export const reportService = new ReportService();
