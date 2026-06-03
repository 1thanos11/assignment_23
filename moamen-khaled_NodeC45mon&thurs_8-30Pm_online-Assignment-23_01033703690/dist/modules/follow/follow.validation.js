import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";
import { PaginateValidation } from "../../common/validation/paginate.validation.js";
class FollowValidation {
    followUser = z.strictObject({ targetUserId: generalValidationFields.id });
    followersList = z
        .strictObject({ targetUserId: generalValidationFields.id })
        .extend(PaginateValidation.shape);
    followRequestsList = z.strictObject({}).extend(PaginateValidation.shape);
}
export const followValidation = new FollowValidation();
