import { GraphQLList, GraphQLObjectType } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";
class GraphQLChatType {
    graphQlTypes = graphQLTypes;
    getOVOChat = new GraphQLObjectType({
        name: "getOVOChatType",
        fields: {
            message: { type: this.graphQlTypes.messageType },
            data: { type: this.graphQlTypes.oneChatType },
        },
    });
    getOVOMessages = new GraphQLObjectType({
        name: "getOVOMessagesType",
        fields: {
            message: { type: this.graphQlTypes.messageType },
            data: { type: new GraphQLList(this.graphQlTypes.oneMessageType) },
        },
    });
}
export const graphQLChatType = new GraphQLChatType();
