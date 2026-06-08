import { GraphQLObjectType } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";
class StoryGraphQLType {
    graphQLType = graphQLTypes;
    uploadStory = new GraphQLObjectType({
        name: "uploadStoryType",
        fields: {
            message: { type: this.graphQLType.messageType },
        },
    });
    getMyStory = new GraphQLObjectType({
        name: "getMyStoryType",
        fields: {
            message: { type: this.graphQLType.messageType },
            data: { type: this.graphQLType.oneStoryType },
        },
    });
    getStoryById = new GraphQLObjectType({
        name: "getStoryByIdType",
        fields: {
            message: { type: this.graphQLType.messageType },
            data: { type: this.graphQLType.oneStoryType },
        },
    });
}
export const storyGraphQLType = new StoryGraphQLType();
