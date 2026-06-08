import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { storyService } from "../story.service.js";
import { storyValidation } from "../story.validation.js";
class StoryResolver {
    storyValidation = storyValidation;
    storyService = storyService;
    uploadStory = async (parent, { content }, context) => {
        const { user } = await GQLAuthentication({ context });
        const validatedData = await GQLValidate({
            schema: this.storyValidation.GraphQLUploadStory,
            args: { content },
        });
        await this.storyService.uploadStory({
            user,
            ...validatedData,
        });
        return { message: "Story uploaded successfully" };
    };
    getMyStory = async (parent, { storyId }, context) => {
        const { user } = await GQLAuthentication({ context });
        const validatedData = await GQLValidate({
            schema: this.storyValidation.getMyStory,
            args: { storyId },
        });
        const story = await this.storyService.getMyStory({
            user,
            ...validatedData,
        });
        return { message: "Success", data: story };
    };
    getStoryById = async (parent, { storyId }, context) => {
        const { user } = await GQLAuthentication({ context });
        const validatedData = await GQLValidate({
            schema: this.storyValidation.getStoryById,
            args: { storyId },
        });
        const story = await this.storyService.getStoryById({
            user,
            ...validatedData,
        });
        return { message: "Success", data: story };
    };
}
export const storyResolver = new StoryResolver();
