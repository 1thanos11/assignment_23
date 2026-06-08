import { RoleEnum } from "../../common/enums/user.enums.js";
export const endPoints = {
    ban: [RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN],
    bannedUsersList: [RoleEnum.ADMIN, RoleEnum.MODERATOR, RoleEnum.SUPER_ADMIN],
    adminDeleteUser: [RoleEnum.ADMIN, RoleEnum.MODERATOR, RoleEnum.SUPER_ADMIN],
};
