import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
class StoryGraphQLArgs {
    uploadStory = { content: { type: new GraphQLNonNull(GraphQLString) } };
    getMyStory = { storyId: { type: new GraphQLNonNull(GraphQLID) } };
    getStoryById = { storyId: { type: new GraphQLNonNull(GraphQLID) } };
}
export const storyGraphQLArgs = new StoryGraphQLArgs();
