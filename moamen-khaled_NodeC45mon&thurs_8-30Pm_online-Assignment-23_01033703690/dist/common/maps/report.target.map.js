import { CommentRepository, DataBaseRepository, PostRepository, UserRepository, } from "../../infra/repository/index.js";
import { ChatRepository } from "../../infra/repository/messaging/chat.repository.js";
import { MessageRepository } from "../../infra/repository/messaging/message.repository.js";
const userRepository = new UserRepository();
const chatRepository = new ChatRepository();
const postRepository = new PostRepository();
const messageRepository = new MessageRepository();
const commentRepository = new CommentRepository();
export const REPORT_TARGET_MAP = {
    User: userRepository,
    Post: postRepository,
    Comment: commentRepository,
    Message: messageRepository,
    Chat: chatRepository,
};
