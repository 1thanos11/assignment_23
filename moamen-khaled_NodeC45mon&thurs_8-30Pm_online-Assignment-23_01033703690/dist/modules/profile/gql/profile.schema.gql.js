import { profileGraphQLArgs } from "./profile.args.gql.js";
import { profileResolver } from "./profile.resolver.js";
import { profileGraphQLType } from "./profile.type.gql.js";
class ProfileGraphQLSchema {
    profileType = profileGraphQLType;
    profileArgs = profileGraphQLArgs;
    profileResolver = profileResolver;
    registerQuery() {
        return {
            profile: {
                description: "User profile query schema",
                type: this.profileType.profile,
                resolve: this.profileResolver.profile,
            },
            getProfileById: {
                description: "Get user profile by id query schema",
                type: this.profileType.getProfileById,
                args: this.profileArgs.getProfileById,
                resolve: this.profileResolver.getProfileById,
            },
            getStats: {
                description: "Get stats of current user",
                type: this.profileType.getStats,
                args: this.profileArgs.getProfileById,
                resolve: this.profileResolver.getStats,
            },
        };
    }
    registerMutation() {
        return {};
    }
}
export const profileGraphQLSchema = new ProfileGraphQLSchema();
