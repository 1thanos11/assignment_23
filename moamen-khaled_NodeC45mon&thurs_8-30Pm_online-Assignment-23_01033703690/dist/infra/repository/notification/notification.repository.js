import { Notification } from "../../database/models/notification.model.js";
import { DataBaseRepository } from "../base.repository.js";
export class NotificationRepository extends DataBaseRepository {
    constructor() {
        super(Notification);
    }
}
