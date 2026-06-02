import { GraphQLID, GraphQLInt, GraphQLNonNull } from "graphql";
class FollowGraphQLArgs {
    follow = { targetUserId: { type: new GraphQLNonNull(GraphQLID) } };
    followersList = {
        targetUserId: { type: new GraphQLNonNull(GraphQLID) },
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
        search: { type: GraphQLInt },
    };
}
export const followGraphQLArgs = new FollowGraphQLArgs();
