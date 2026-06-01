import { PushStatusEnum } from "../../../common/enums/notification.enums.js";
import { pushService } from "../../../common/services/push.service.js";
import { redisService } from "../../../common/services/redis.service.js";
import { NotificationRepository } from "../../repository/index.js";
class NotificationProcess {
    redis = redisService;
    push = pushService;
    notificationRepository = new NotificationRepository();
    async sendMultipleNotifications({ userIds, title, body, notificationId, }) {
        const tokensArrays = await this.redis.pipeline({
            items: userIds,
            command: (id, pipe) => {
                pipe.sMembers(this.redis.FCMKey(id));
            },
        });
        const tokens = [...new Set(tokensArrays.flat())];
        if (!tokens.length) {
            return;
        }
        const result = await this.push.sendMultipleNotifications({
            tokens,
            title,
            body,
        });
        if (result.successCount === 0) {
            await this.notificationRepository.findOneAndUpdate({
                filter: { _id: notificationId },
                update: { pushStatus: PushStatusEnum.FAILED },
            });
        }
        await this.notificationRepository.findOneAndUpdate({
            filter: { _id: notificationId },
            update: { pushStatus: PushStatusEnum.SENT, pushSentAt: new Date() },
        });
    }
}
export const notificationProcess = new NotificationProcess();
