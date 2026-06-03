import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { postService } from "../post.service.js";
import { postValidationSchema } from "../post.validation.js";
class PostGraphQLResolver {
    postService = postService;
    postSchema = postValidationSchema;
    postsList = async (parent, { page, limit, search, targetUserId }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GQLValidate({
            schema: this.postSchema.postsList,
            args: { page, limit, search, targetUserId },
        });
        const { message, posts } = await this.postService.postsList({
            user,
            targetUserId,
            page,
            limit,
            search,
        });
        return { message, data: posts };
    };
    getPostById = async (parent, { targetUserId, postId }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GQLValidate({
            schema: this.postSchema.getPostById,
            args: { targetUserId, postId },
        });
        const { message, post } = await postService.getPostById({
            user,
            targetUserId,
            postId,
        });
        return { message, data: post };
    };
}
export const postGraphQLResolver = new PostGraphQLResolver();
