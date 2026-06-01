import { graphQLCommentArgs } from "./comment.args.gql.js";
import { graphQLCommentResolver } from "./comment.resolver.js";
import { graphQLCommentType } from "./comment.type.gql.js";
class GraphQLCommentSchema {
    commentType = graphQLCommentType;
    commentArgs = graphQLCommentArgs;
    commentResolver = graphQLCommentResolver;
    registerQuery() {
        return {
            getComment: {
                description: `get comment by id`,
                type: this.commentType.getComment,
                args: this.commentArgs.getComment,
                resolve: this.commentResolver.getComment,
            },
            commentsList: {
                description: `comments list of post`,
                type: this.commentType.commentsList,
                args: this.commentArgs.commentsList,
                resolve: this.commentResolver.commentsList,
            },
        };
    }
}
export const commentGraphQLSchema = new GraphQLCommentSchema();
