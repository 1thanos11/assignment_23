import { NotificationRepository } from "../../infra/repository/index.js";
import { NOTIFICATION_LIST_PROJECTION } from "../../common/constants/notification.constants.js";
class NotificationService {
    notificationRepository;
    constructor() {
        this.notificationRepository = new NotificationRepository();
    }
    async createOneNotification(inputs) {
        const { recipientId, actorId, notificationType, notificationTargetType, notificationTargetId, title, body, postId, commentId, messageId, username, avatarUrl, pushStatus, } = inputs;
        const notification = await this.notificationRepository.createOne({
            data: {
                recipientId,
                actorId,
                notificationType,
                notificationTargetType,
                notificationTargetId,
                title,
                body,
                pushStatus,
                data: {
                    postId,
                    commentId,
                    messageId,
                    username,
                    avatarUrl,
                },
            },
        });
        return notification;
    }
    async notificationList(inputs) {
        const { user, page, limit } = inputs;
        const list = await this.notificationRepository.paginate({
            filter: { recipientId: user._id },
            projection: NOTIFICATION_LIST_PROJECTION,
            page: page,
            limit: limit,
        });
        return list;
    }
}
export const notificationService = new NotificationService();
