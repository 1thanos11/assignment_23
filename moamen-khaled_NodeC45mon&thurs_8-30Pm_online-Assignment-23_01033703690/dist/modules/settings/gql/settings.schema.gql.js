import { GraphQLString } from "graphql";
import { settingsGraphQLArgs } from "./settings.args.gql.js";
import { settingsResolver } from "./settings.resolver.js";
import { settingsGraphQLType } from "./settings.types.gql.js";
class SettingsGraphQLSchema {
    settingsType = settingsGraphQLType;
    settingsArgs = settingsGraphQLArgs;
    settingsResolver = settingsResolver;
    registerQuery() {
        return {
            getSettings: {
                description: `get settings of current user`,
                type: this.settingsType.settings,
                resolve: this.settingsResolver.getSettings,
            },
        };
    }
    registerMutation() {
        return {
            updateSettings: {
                description: `update settings of current user`,
                type: this.settingsType.settings,
                args: this.settingsArgs.updateSettings,
                resolve: this.settingsResolver.updateSettings,
            },
        };
    }
}
export const settingsGraphQLSchema = new SettingsGraphQLSchema();
