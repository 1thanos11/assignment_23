import { RoleEnum } from "../../common/enums/user.enums.js";
export const endpoints = {
    report: [RoleEnum.USER],
    reportsAndModerationCases: [
        RoleEnum.SUPER_ADMIN,
        RoleEnum.ADMIN,
        RoleEnum.MODERATOR,
    ],
    takeActionForModerationCase: [RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN],
};
