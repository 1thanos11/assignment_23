import { postService } from "./post.service.js";
import { successResponse } from "../../common/responses/success.response.js";
class PostController {
    postService = postService;
    async createPost(req, res) {
        const { content, postVisibility, tags } = req.body;
        const result = await this.postService.createPost({
            user: req.user,
            content,
            files: req.files,
            postVisibility,
            tags,
        });
        return successResponse({ res, status: 201, data: result });
    }
    async updatePost(req, res) {
        const { content, postVisibility, tags, removeTags, removeFiles } = req.body;
        const { postId } = req.params;
        const result = await this.postService.updatePost({
            user: req.user,
            postId: postId,
            content,
            files: req.files,
            postVisibility,
            tags,
            removeTags,
            removeFiles,
        });
        return successResponse({ res, status: 200, data: result });
    }
    async postsList(req, res) {
        const { page, limit, search } = req.query;
        const { targetUserId } = req.params;
        const result = await this.postService.postsList({
            user: req.user,
            targetUserId: targetUserId,
            page: page,
            limit: limit,
            search,
        });
        return successResponse({ res, status: 200, data: result });
    }
}
export const postController = new PostController();
