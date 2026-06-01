import { commentService } from "./comment.service.js";
import { successResponse } from "../../common/responses/success.response.js";
class CommentController {
    commentService = commentService;
    createComment = async (req, res) => {
        const { content, mentions, parentCommentId } = req.body;
        const { postId } = req.params;
        const comment = await this.commentService.createComment({
            user: req.user,
            postId: postId,
            parentCommentId,
            content,
            files: req.files,
            mentions,
        });
        return successResponse({ res, status: 201, data: comment });
    };
    updateComment = async (req, res) => {
        const comment = await this.commentService.updateComment({
            user: req.user,
            files: req.files,
            ...req.body,
            ...req.params,
        });
        return successResponse({ res, data: comment });
    };
}
export const commentController = new CommentController();
