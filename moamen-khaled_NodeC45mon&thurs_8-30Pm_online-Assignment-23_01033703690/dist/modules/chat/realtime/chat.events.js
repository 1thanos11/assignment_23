import { socketValidate } from "../../../middlewares/validation.middleware.js";
import { chatValidation } from "../chat.validation.js";
import { chatService } from "../chat.service.js";
import { redisService } from "../../../common/services/redis.service.js";
class ChatEvent {
    chatValidation = chatValidation;
    get chatService() {
        return chatService;
    }
    redis = redisService;
    joinChat = (socket) => {
        return socket.on("join_chat", async ({ chatId }) => {
            try {
                socket.join(chatId);
                socket.data.currentChat = chatId;
            }
            catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };
    leaveChat = (socket) => {
        return socket.on("leave_chat", async ({ chatId }) => {
            try {
                socket.leave(chatId);
                if (socket.data.currentChat?.toString() === chatId.toString()) {
                    socket.data.currentChat = null;
                }
            }
            catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };
    sendOVOMessage = (socket) => {
        return socket.on("sendOVOMessage", async (inputs) => {
            try {
                const { sendTo, content } = inputs;
                await socketValidate({
                    schema: this.chatValidation.sendOVOMessage,
                    args: { sendTo, content },
                });
                const message = await this.chatService.sendOVOMessage({
                    content,
                    sendTo,
                    user: socket.data.user,
                });
                socket.emit("successMessage", { content });
                socket
                    .to(await this.redis.sMembers(this.redis.socketKey(sendTo)))
                    .emit("newMessage", message);
            }
            catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };
    join_room = (socket) => {
        return socket.on("join_room", async ({ roomId }) => {
            try {
                socket.join(roomId);
            }
            catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };
    sendOVMMessages = (socket, io) => {
        return socket.on("sendOVMMessages", async (inputs) => {
            try {
                const { chatId, content } = inputs;
                await socketValidate({
                    schema: this.chatValidation.sendOVMMessages,
                    args: { chatId, content },
                });
                const { roomId, message } = await this.chatService.sendOVMMessage({
                    user: socket.data.user,
                    chatId,
                    content,
                });
                io.to(await this.redis.sMembers(this.redis.socketKey(socket.data.user._id))).emit("successMessage", { message, sendTo: chatId });
                socket.to(roomId).emit("newMessage", { message, chatId });
            }
            catch (error) {
                socket.emit("custom_error");
            }
        });
    };
}
export const chatEvent = new ChatEvent();
