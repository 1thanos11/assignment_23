import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { chatService } from "../chat.service.js";
import { chatValidation } from "../chat.validation.js";
class GraphQLChatResolver {
    chatValidation = chatValidation;
    chatService = chatService;
    getOVOChat = async (parent, { chatId }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GQLValidate({
            schema: this.chatValidation.getOVOChat,
            args: { chatId },
        });
        const chat = await this.chatService.getChat({ user, chatId });
        return { message: "Success", data: chat };
    };
    getOVOMessages = async (parent, { chatId, cursor }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GQLValidate({
            schema: chatValidation.getOVOMessages,
            args: { chatId, cursor },
        });
        const messages = await this.chatService.getChatMessages({
            user,
            chatId,
            cursor,
        });
        return { message: "Success", data: messages };
    };
}
export const graphQLChatResolver = new GraphQLChatResolver();
