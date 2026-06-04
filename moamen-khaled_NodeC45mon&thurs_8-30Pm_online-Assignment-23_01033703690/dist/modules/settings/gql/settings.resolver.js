import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { settingsService } from "../settings.service.js";
import { settingsValidation } from "../settings.validation.js";
class SettingsResolver {
    settingsValidation = settingsValidation;
    settingsService = settingsService;
    updateSettings = async (parent, { profileVisibility, showOnLineStatus, showLastSeen, showEmail, showPhone, showLocation, showDOB, showJoinedAt, showEducation, showRelation, showFollowersList, showFollowingsList, language, showInSearch, showInRecommendations, allowNotifications, allowGroupAdding, }, context) => {
        const { user } = await GQLAuthentication({ context });
        const validatedData = await GQLValidate({
            schema: settingsValidation.updateSettings,
            args: {
                profileVisibility,
                showOnLineStatus,
                showLastSeen,
                showEmail,
                showPhone,
                showLocation,
                showDOB,
                showJoinedAt,
                showEducation,
                showRelation,
                showFollowersList,
                showFollowingsList,
                language,
                showInSearch,
                showInRecommendations,
                allowNotifications,
                allowGroupAdding,
            },
        });
        const settings = await this.settingsService.updateSettings({
            user,
            ...validatedData,
        });
        return { message: "Success", data: settings };
    };
    getSettings = async (parent, args, context) => {
        const { user } = await GQLAuthentication({ context });
        const settings = await this.settingsService.getSettings({ user });
        return { message: "Success", data: settings };
    };
}
export const settingsResolver = new SettingsResolver();
