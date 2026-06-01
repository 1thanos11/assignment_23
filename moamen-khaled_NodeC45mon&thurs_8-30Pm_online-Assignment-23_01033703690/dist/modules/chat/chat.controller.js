import { chatService } from "./chat.service.js";
import { successResponse } from "../../common/responses/success.response.js";
class ChatController {
    get chat() {
        return chatService;
    }
    createGroup = async (req, res) => {
        const group = await this.chat.createGroup({ user: req.user, ...req.body });
        return successResponse({ res, status: 201, data: group });
    };
}
export const chatController = new ChatController();
