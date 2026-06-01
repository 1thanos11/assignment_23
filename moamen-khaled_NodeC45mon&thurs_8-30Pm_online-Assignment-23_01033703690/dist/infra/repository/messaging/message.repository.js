import { Message } from "../../database/models/message.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class MessageRepository extends DataBaseRepository {
    constructor() {
        super(Message);
    }
}
