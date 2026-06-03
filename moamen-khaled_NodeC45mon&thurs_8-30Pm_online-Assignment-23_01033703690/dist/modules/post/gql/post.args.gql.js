import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
class PostGraphQLArgs {
    postsList = {
        targetUserId: { type: new GraphQLNonNull(GraphQLID) },
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
        search: { type: GraphQLString },
    };
    getPostById = {
        targetUserId: { type: new GraphQLNonNull(GraphQLID) },
        postId: { type: new GraphQLNonNull(GraphQLID) },
    };
}
export const postGraphQLArgs = new PostGraphQLArgs();
