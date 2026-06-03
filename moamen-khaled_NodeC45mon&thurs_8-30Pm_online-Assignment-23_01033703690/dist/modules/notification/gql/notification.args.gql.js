import { GraphQLInt } from "graphql";
class NotificationGQLArgs {
    notificationList = {
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
    };
}
export const notificationGQLArgs = new NotificationGQLArgs();
