import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { profileService, } from "../profile.service.js";
import { profileValidationSchema } from "../profile.validation.js";
class ProfileResolver {
    profileService = profileService;
    profile = async (parent, args, context) => {
        const { user } = await GQLAuthentication({ context });
        const { profile, stats, email, phone } = await this.profileService.profile({
            user,
        });
        return { data: { profile, stats, email, phone } };
    };
    getProfileById = async (parent, { targetId }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GQLValidate({
            schema: profileValidationSchema.getProfileById,
            args: { targetId },
        });
        const { profile, stats, email, phone, lastSeenAt } = await this.profileService.getProfileById({
            user,
            targetId,
        });
        return { data: { profile, stats, email, phone, lastSeenAt } };
    };
}
export const profileResolver = new ProfileResolver();
