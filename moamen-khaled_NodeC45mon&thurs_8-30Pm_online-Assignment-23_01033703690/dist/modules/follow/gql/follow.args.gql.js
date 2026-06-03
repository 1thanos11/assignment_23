import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
class FollowGraphQLArgs {
    follow = { targetUserId: { type: new GraphQLNonNull(GraphQLID) } };
    followList = {
        targetUserId: { type: new GraphQLNonNull(GraphQLID) },
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
        search: { type: GraphQLString },
    };
}
export const followGraphQLArgs = new FollowGraphQLArgs();
