import { adminGraphQLArgs } from "./admin.args.gql.js";
import { adminResolver } from "./admin.resolver.js";
import { adminGraphQLType } from "./admin.types.gql.js";
class AdminGraphQLSchema {
    adminType = adminGraphQLType;
    adminArgs = adminGraphQLArgs;
    adminResolver = adminResolver;
    registerQuery() {
        return {
            bannedUsersList: {
                description: "admin get banned users list",
                type: this.adminType.bannedUsersList,
                args: this.adminArgs.bannedUsersList,
                resolve: this.adminResolver.bannedUsersList,
            },
        };
    }
    registerMutation() {
        return {
            ban: {
                description: "admin ban user",
                type: this.adminType.ban,
                args: this.adminArgs.ban,
                resolve: this.adminResolver.ban,
            },
            unBan: {
                description: "admin un ban user",
                type: this.adminType.ban,
                args: this.adminArgs.unBan,
                resolve: this.adminResolver.unBan,
            },
        };
    }
}
export const adminGraphQLSchema = new AdminGraphQLSchema();
