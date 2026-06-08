import { JobEnum } from "../../common/enums/job.enums.js";
import { RoleEnum } from "../../common/enums/user.enums.js";
import { ConflictError, NotFoundError, } from "../../common/errors/client.errors.js";
import { redisService } from "../../common/services/redis.service.js";
import { emailTemplate } from "../../common/utils/email/template.email.js";
import { emailQueue } from "../../infra/queue/queues/email.queue.js";
import { UserRepository } from "../../infra/repository/index.js";
import { CacheTTL } from "../../common/constants/cache.constants.js";
class AdminService {
    userRepository;
    redis = redisService;
    constructor() {
        this.userRepository = new UserRepository();
    }
    async banUser(inputs) {
        const { user, targetUserId, banReason } = inputs;
        if (user._id.equals(targetUserId)) {
            throw new ConflictError(`You can't ban yourself`);
        }
        const targetUser = await this.userRepository.findOneAndUpdate({
            filter: { _id: targetUserId, role: RoleEnum.USER },
            update: {
                $set: {
                    bannedAt: new Date(),
                    banReason: banReason,
                    adminBanner: user._id,
                },
            },
        });
        if (!targetUser) {
            throw new NotFoundError(`User not found`);
        }
        await emailQueue.add(JobEnum.SEND_EMAIL, {
            to: targetUser.email,
            subject: `Ban notify`,
        }, {
            attempts: 3,
            backoff: { type: "exponential", delay: 3000 },
            removeOnComplete: true,
            removeOnFail: false,
        });
        await this.redis.incrementUserVersion(targetUserId);
        return;
    }
    async unBan(inputs) {
        const { targetUserId } = inputs;
        const targetUser = await this.userRepository.findOneAndUpdate({
            filter: { _id: targetUserId, onlyBanned: true },
            update: {
                $set: { banCancelledAt: new Date() },
                $unset: { bannedAt: 1, banReason: 1, adminBanner: 1 },
            },
        });
        if (!targetUser) {
            throw new NotFoundError(`User not found`);
        }
        await emailQueue.add(JobEnum.SEND_EMAIL, { to: targetUser.email, subject: `You are un ban notify` }, { attempts: 3, backoff: { type: "exponential", delay: 3000 } });
        return;
    }
    async bannedUsers({ page, limit, search, }) {
        const pipeline = [
            { $match: { bannedAt: { $ne: null } } },
        ];
        if (search?.trim()) {
            pipeline.push({
                $lookup: {
                    from: "profiles",
                    localField: "_id",
                    foreignField: "ownerId",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                avatarUrl: 1,
                            },
                        },
                    ],
                    as: "user",
                },
            }, { $unwind: "$user" }, { $unwind: "$user" }, { $match: { "user.username": { $regex: search, $options: "i" } } }, { $sort: { bannedAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit });
        }
        else {
            pipeline.push({ $sort: { bannedAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit }, {
                $lookup: {
                    from: "profiles",
                    localField: "_id",
                    foreignField: "ownerId",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                avatarUrl: 1,
                            },
                        },
                    ],
                    as: "user",
                },
            }, { $unwind: "$user" }, { $unwind: "$user" });
        }
        const version = await this.redis.getBannedUsersListVersion();
        const key = this.redis.bannedUsersList({
            page: page,
            limit: limit,
            search: search,
            version,
        });
        const users = await this.redis.cache({
            key,
            ttl: CacheTTL.BANNED_USERS_LIST,
            fn: () => this.userRepository.aggregate({
                pipeline,
            }),
        });
        if (!users?.length) {
            return [];
        }
        return users;
    }
    async bannedUsersList(inputs) {
        const { page, limit, search } = inputs;
        const users = await this.bannedUsers({
            page: page,
            limit: limit,
            search: search,
        });
        return users;
    }
}
export const adminService = new AdminService();
