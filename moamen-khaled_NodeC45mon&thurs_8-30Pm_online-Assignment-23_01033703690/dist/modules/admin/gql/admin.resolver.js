import { GQLAuthentication, GraphQLAuthorization, } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { endPoints } from "../admin.authorization.js";
import { adminService } from "../admin.service.js";
import { adminValidation } from "../admin.validation.js";
class AdminResolver {
    adminValidation = adminValidation;
    adminService = adminService;
    ban = async (parent, { targetUserId, banReason }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GraphQLAuthorization({ user, allowedRoles: endPoints.ban });
        const validatedData = await GQLValidate({
            schema: this.adminValidation.ban,
            args: { targetUserId, banReason },
        });
        await this.adminService.banUser({ user, ...validatedData });
        return { message: "Success" };
    };
    unBan = async (parent, { targetUserId }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GraphQLAuthorization({ user, allowedRoles: endPoints.ban });
        const validatedData = await GQLValidate({
            schema: this.adminValidation.unBan,
            args: { targetUserId },
        });
        await this.adminService.unBan({ user, ...validatedData });
        return { message: "Success" };
    };
    bannedUsersList = async (parent, { page, limit, search }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GraphQLAuthorization({ user, allowedRoles: endPoints.ban });
        const validatedData = await GQLValidate({
            schema: this.adminValidation.bannedUsersList,
            args: { page, limit, search },
        });
        const users = await this.adminService.bannedUsersList({ ...validatedData });
        return { message: "Success", data: users };
    };
    adminDeleteUser = async (parent, { targetUserId }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GraphQLAuthorization({ user, allowedRoles: endPoints.adminDeleteUser });
        const validatedData = await GQLValidate({
            schema: this.adminValidation.adminDeleteUser,
            args: { targetUserId },
        });
        await this.adminService.adminDeleteUser({ ...validatedData });
        return { message: "Success" };
    };
}
export const adminResolver = new AdminResolver();
