import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
class AdminGraphQLArgs {
    ban = {
        targetUserId: { type: new GraphQLNonNull(GraphQLID) },
        banReason: { type: new GraphQLNonNull(GraphQLString) },
    };
    unBan = { targetUserId: { type: new GraphQLNonNull(GraphQLID) } };
    bannedUsersList = {
        page: { type: GraphQLInt, limit: GraphQLInt, search: GraphQLString },
    };
}
export const adminGraphQLArgs = new AdminGraphQLArgs();
