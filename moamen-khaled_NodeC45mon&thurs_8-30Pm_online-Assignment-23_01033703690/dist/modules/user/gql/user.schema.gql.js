import { GraphQLString } from "graphql";
import { userGraphQLArgs } from "./user.args.gql.js";
import { userResolver } from "./user.resolver.js";
import { userGraphQLType } from "./user.type.gql.js";
class UserGraphQLSchema {
    userType = userGraphQLType;
    userArgs = userGraphQLArgs;
    userResolver = userResolver;
    registerQuery() {
        return {
            dummy: {
                description: "Dummy query for testing",
                type: GraphQLString,
                resolve: () => "User module is working 🚀",
            },
        };
    }
    registerMutation() {
        return {
            refreshToken: {
                description: "refresh token mutation schema",
                type: this.userType.refreshToken,
                resolve: this.userResolver.refreshToken,
            },
            logout: {
                description: "logout mutation schema",
                args: this.userArgs.logout,
                type: this.userType.logout,
                resolve: this.userResolver.logout,
            },
        };
    }
}
export const userGraphQLSchema = new UserGraphQLSchema();
