import { GQLAuthentication, GraphQLAuthorization, } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { endpoints } from "../report.authorization.js";
import { reportService } from "../report.service.js";
import { reportValidation } from "../report.validation.js";
class ReportResolver {
    reportValidation = reportValidation;
    reportService = reportService;
    report = async (parent, { targetId, targetType, reason, customReason, snapshot }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GraphQLAuthorization({ user, allowedRoles: endpoints.report });
        const validatedData = await GQLValidate({
            schema: this.reportValidation.report,
            args: { targetId, targetType, reason, customReason, snapshot },
        });
        await this.reportService.report({ user, ...validatedData });
        return { message: "Success" };
    };
    openReport = async (parent, { reportId }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GraphQLAuthorization({
            user,
            allowedRoles: endpoints.reportsAndModerationCases,
        });
        const validatedData = await GQLValidate({
            schema: reportValidation.openReport,
            args: { reportId },
        });
        const report = await this.reportService.openReport({ ...validatedData });
        return { message: "Success", data: report };
    };
    openModerationCase = async (parent, { moderationCaseId }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GraphQLAuthorization({
            user,
            allowedRoles: endpoints.reportsAndModerationCases,
        });
        const validatedData = await GQLValidate({
            schema: this.reportValidation.openModerationCase,
            args: { moderationCaseId },
        });
        const moderationCase = await this.reportService.openModerationCase({
            moderationCaseId,
        });
        return { message: "Success", data: moderationCase };
    };
    takeActionForModerationCase = async (parent, { moderationCaseId, action, customAction, status, }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GraphQLAuthorization({
            user,
            allowedRoles: endpoints.takeActionForModerationCase,
        });
        const validatedData = await GQLValidate({
            schema: this.reportValidation.takeActionForModerationCae,
            args: { moderationCaseId, action, customAction, status },
        });
        await this.reportService.takeActionForModerationCase({
            user,
            moderationCaseId,
            action,
            customAction,
            status,
        });
        return { message: "Success" };
    };
}
export const reportResolver = new ReportResolver();
