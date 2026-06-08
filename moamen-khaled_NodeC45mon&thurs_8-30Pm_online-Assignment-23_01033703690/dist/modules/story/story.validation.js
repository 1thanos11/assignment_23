import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";
class StoryValidation {
    GraphQLUploadStory = z.strictObject({
        content: generalValidationFields.string(1, 100),
    });
    getMyStory = z.strictObject({ storyId: generalValidationFields.id });
    getStoryById = z.strictObject({
        storyId: generalValidationFields.id,
    });
}
export const storyValidation = new StoryValidation();
