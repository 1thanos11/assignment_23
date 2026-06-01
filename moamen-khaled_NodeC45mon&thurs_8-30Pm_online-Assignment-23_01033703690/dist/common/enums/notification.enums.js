export var NotificationTypeEnum;
(function (NotificationTypeEnum) {
    NotificationTypeEnum["LIKE"] = "Like";
    NotificationTypeEnum["COMMENT"] = "Comment";
    NotificationTypeEnum["FOLLOW"] = "Follow";
    NotificationTypeEnum["MENTION"] = "Mention";
    NotificationTypeEnum["MESSAGE"] = "Message";
    NotificationTypeEnum["CHAT"] = "Chat";
    NotificationTypeEnum["SYSTEM"] = "System";
})(NotificationTypeEnum || (NotificationTypeEnum = {}));
export var NotificationTargetTypeEnum;
(function (NotificationTargetTypeEnum) {
    NotificationTargetTypeEnum["POST"] = "Post";
    NotificationTargetTypeEnum["COMMENT"] = "Comment";
    NotificationTargetTypeEnum["USER"] = "User";
    NotificationTargetTypeEnum["MESSAGE"] = "Message";
    NotificationTargetTypeEnum["CHAT"] = "Chat";
})(NotificationTargetTypeEnum || (NotificationTargetTypeEnum = {}));
export var PushStatusEnum;
(function (PushStatusEnum) {
    PushStatusEnum["PENDING"] = "Pending";
    PushStatusEnum["PARTIAL"] = "Partial";
    PushStatusEnum["SENT"] = "Sent";
    PushStatusEnum["FAILED"] = "Failed";
})(PushStatusEnum || (PushStatusEnum = {}));
