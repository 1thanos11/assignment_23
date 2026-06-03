import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { notificationService } from "../notification.service.js";
class NotificationResolver {
    notification = notificationService;
    notificationList = async (parent, { page, limit }, context) => {
        const { user } = await GQLAuthentication({ context });
        const { data, meta } = await this.notification.notificationList({
            user,
            page,
            limit,
        });
        return { data, meta };
    };
}
export const notificationGQLResolver = new NotificationResolver();
