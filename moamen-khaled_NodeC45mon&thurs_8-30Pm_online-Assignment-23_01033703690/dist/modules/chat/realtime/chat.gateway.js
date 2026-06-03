import { chatEvent } from "./chat.events.js";
class ChatGateWay {
    chatEvent = chatEvent;
    registerEvents(socket, io) {
        this.chatEvent.joinChat(socket);
        this.chatEvent.leaveChat(socket);
        this.chatEvent.sendOVOMessage(socket);
        this.chatEvent.join_room(socket);
        this.chatEvent.sendOVMMessages(socket, io);
    }
}
export const chatGateWay = new ChatGateWay();
