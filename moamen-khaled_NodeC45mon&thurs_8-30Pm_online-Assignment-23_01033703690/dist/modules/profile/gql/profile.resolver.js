import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { profileService } from "../profile.service.js";
import { profileValidationSchema } from "../profile.validation.js";
class ProfileResolver {
    profileValidation = profileValidationSchema;
    profileService = profileService;
    profile = async (parent, args, context) => {
        const { user } = await GQLAuthentication({ context });
        const { profile, stats } = await this.profileService.profile({
            user,
        });
        return { data: { profile, stats } };
    };
    getProfileById = async (parent, { targetId }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GQLValidate({
            schema: this.profileValidation.getProfileById,
            args: { targetId },
        });
        const { profile, stats } = await this.profileService.getProfileById({
            user,
            targetId,
        });
        return { data: { profile, stats } };
    };
    getStats = async (parent, { targetId }, context) => {
        await GQLAuthentication({ context });
        const verifiedData = await GQLValidate({
            schema: this.profileValidation.getStats,
            args: { targetId },
        });
        const stats = await this.profileService.getStats({ ...verifiedData });
        return { message: "Success", data: stats };
    };
}
export const profileResolver = new ProfileResolver();
