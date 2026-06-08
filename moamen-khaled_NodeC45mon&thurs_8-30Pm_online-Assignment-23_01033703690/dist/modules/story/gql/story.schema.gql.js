import { storyGraphQLType } from "./story.types.gql.js";
import { storyGraphQLArgs } from "./story.args.gql.js";
import { storyResolver } from "./story.resolver.js";
class StoryGraphQLSchema {
    storyGraphQLType = storyGraphQLType;
    storyGraphQLArgs = storyGraphQLArgs;
    storyResolver = storyResolver;
    registerQuery() {
        return {
            getMyStory: {
                description: "get my story",
                type: this.storyGraphQLType.getMyStory,
                args: this.storyGraphQLArgs.getMyStory,
                resolve: this.storyResolver.getMyStory,
            },
            getStoryById: {
                description: "get story by id",
                type: this.storyGraphQLType.getStoryById,
                args: this.storyGraphQLArgs.getStoryById,
                resolve: this.storyResolver.getStoryById,
            },
        };
    }
    registerMutation() {
        return {
            uploadStory: {
                description: "upload story",
                type: this.storyGraphQLType.uploadStory,
                args: this.storyGraphQLArgs.uploadStory,
                resolve: this.storyResolver.uploadStory,
            },
        };
    }
}
export const storyGraphQLSchema = new StoryGraphQLSchema();
