import { GraphQLID, GraphQLInt, GraphQLNonNull } from "graphql";
class GraphQLCommentArgs {
    getComment = {
        commentId: { type: new GraphQLNonNull(GraphQLID) },
    };
    commentsList = {
        postId: { type: new GraphQLNonNull(GraphQLID) },
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
    };
}
export const graphQLCommentArgs = new GraphQLCommentArgs();
