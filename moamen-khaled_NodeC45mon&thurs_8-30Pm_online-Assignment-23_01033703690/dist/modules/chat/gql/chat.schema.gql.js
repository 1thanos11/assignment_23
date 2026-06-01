import { graphQLChatArgs } from "./chat.args.gql.js";
import { graphQLChatResolver } from "./chat.resolver.js";
import { graphQLChatType } from "./chat.types.gql.js";
class ChatGraphQLSchema {
    chatType = graphQLChatType;
    chatArgs = graphQLChatArgs;
    chatResolver = graphQLChatResolver;
    registerQuery() {
        return {
            getOVOChat: {
                description: "get OVO Chat",
                type: this.chatType.getOVOChat,
                args: this.chatArgs.getOVOChat,
                resolve: this.chatResolver.getOVOChat,
            },
            getOVOMessages: {
                description: "get OVO messages",
                type: this.chatType.getOVOMessages,
                args: this.chatArgs.getOVOMessages,
                resolve: this.chatResolver.getOVOMessages,
            },
        };
    }
}
export const chatGraphQLSchema = new ChatGraphQLSchema();
