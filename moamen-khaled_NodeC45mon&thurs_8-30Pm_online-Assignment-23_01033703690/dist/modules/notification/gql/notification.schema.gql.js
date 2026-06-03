import { notificationGQLArgs } from "./notification.args.gql.js";
import { notificationGQLResolver } from "./notification.resolver.js";
import { notificationGQLType } from "./notification.type.gql.js";
class NotificationGraphQLSchema {
    notificationType = notificationGQLType;
    notificationArgs = notificationGQLArgs;
    notificationResolver = notificationGQLResolver;
    registerQuery() {
        return {
            notificationList: {
                description: "Notification list query schema",
                type: this.notificationType.notificationList,
                args: this.notificationArgs.notificationList,
                resolve: this.notificationResolver.notificationList,
            },
        };
    }
}
export const notificationGraphQLSchema = new NotificationGraphQLSchema();
