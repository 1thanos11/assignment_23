import { Queue } from "bullmq";
import { ioredis } from "../ioredis.queue.connection.js";
export const CHAT_QUEUE_NAME = "Chat_Queue";
export const chatQueue = new Queue(CHAT_QUEUE_NAME, { connection: ioredis });
