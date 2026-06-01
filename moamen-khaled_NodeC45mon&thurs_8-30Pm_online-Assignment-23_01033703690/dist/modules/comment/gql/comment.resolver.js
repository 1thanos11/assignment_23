import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { commentService } from "../comment.service.js";
import { commentValidationSchema } from "../comment.validation.js";
class GraphQLCommentResolver {
    commentValidation = commentValidationSchema;
    commentService = commentService;
    getComment = async (parent, { commentId }, context) => {
        await GQLAuthentication({ context });
        await GQLValidate({
            schema: this.commentValidation.getComment,
            args: { commentId },
        });
        const comment = await this.commentService.getComment({ commentId });
        return { message: `Success`, data: comment };
    };
    commentsList = async (parent, { postId, page, limit }, context) => {
        await GQLAuthentication({ context });
        await GQLValidate({
            schema: this.commentValidation.commentsListOfPost,
            args: { postId, page, limit },
        });
        const comments = await this.commentService.commentsListOfPost({
            postId,
            page,
            limit,
        });
        return { message: `Success`, data: comments };
    };
}
export const graphQLCommentResolver = new GraphQLCommentResolver();
