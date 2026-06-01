import { Chat } from "../../database/models/chat.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class ChatRepository extends DataBaseRepository {
    constructor() {
        super(Chat);
    }
}
