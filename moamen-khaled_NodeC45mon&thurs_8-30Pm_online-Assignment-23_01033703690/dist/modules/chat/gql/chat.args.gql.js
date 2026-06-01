import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
class GraphQLChatArgs {
    getOVOChat = { chatId: { type: new GraphQLNonNull(GraphQLString) } };
    getOVOMessages = {
        chatId: { type: new GraphQLNonNull(GraphQLString) },
        cursor: { type: GraphQLID },
    };
}
export const graphQLChatArgs = new GraphQLChatArgs();
