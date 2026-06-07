export var ReportReasonEnum;
(function (ReportReasonEnum) {
    ReportReasonEnum["SPAM"] = "SPAM";
    ReportReasonEnum["HARASSMENT"] = "HARASSMENT";
    ReportReasonEnum["HATE_SPEECH"] = "HATE_SPEECH";
    ReportReasonEnum["NUDITY"] = "NUDITY";
    ReportReasonEnum["VIOLENCE"] = "VIOLENCE";
    ReportReasonEnum["SCAM"] = "SCAM";
    ReportReasonEnum["COPYRIGHT"] = "COPYRIGHT";
    ReportReasonEnum["IMPERSONATION"] = "IMPERSONATION";
    ReportReasonEnum["OTHER"] = "OTHER";
})(ReportReasonEnum || (ReportReasonEnum = {}));
export var ReportStatusEnum;
(function (ReportStatusEnum) {
    ReportStatusEnum["PENDING"] = "PENDING";
    ReportStatusEnum["OPENED"] = "OPENED";
    ReportStatusEnum["UNDER_REVIEW"] = "UNDER_REVIEW";
    ReportStatusEnum["RESOLVED"] = "RESOLVED";
    ReportStatusEnum["REJECTED"] = "REJECTED";
})(ReportStatusEnum || (ReportStatusEnum = {}));
export var ReportActionEnum;
(function (ReportActionEnum) {
    ReportActionEnum["NO_ACTION"] = "NoAction";
    ReportActionEnum["CONTENT_REMOVED"] = "ContentRemoved";
    ReportActionEnum["CONTENT_RESTRICTED"] = "ContentRestricted";
    ReportActionEnum["WARNING_ISSUED"] = "WarningIssued";
    ReportActionEnum["USER_MUTED"] = "UserMuted";
    ReportActionEnum["USER_SUSPENDED"] = "UserSuspended";
    ReportActionEnum["USER_BANNED"] = "UserBanned";
    ReportActionEnum["ACCOUNT_DEACTIVATED"] = "AccountDeactivated";
    ReportActionEnum["REPORT_DUPLICATE"] = "ReportDuplicate";
    ReportActionEnum["ESCALATED"] = "Escalated";
    ReportActionEnum["OTHER"] = "Other";
})(ReportActionEnum || (ReportActionEnum = {}));
export var ReportPriorityEnum;
(function (ReportPriorityEnum) {
    ReportPriorityEnum[ReportPriorityEnum["LOW"] = 3] = "LOW";
    ReportPriorityEnum[ReportPriorityEnum["MEDIUM"] = 2] = "MEDIUM";
    ReportPriorityEnum[ReportPriorityEnum["HIGH"] = 1] = "HIGH";
    ReportPriorityEnum[ReportPriorityEnum["CRITICAL"] = 0] = "CRITICAL";
})(ReportPriorityEnum || (ReportPriorityEnum = {}));
export var ReportTargetTypeEnum;
(function (ReportTargetTypeEnum) {
    ReportTargetTypeEnum["USER"] = "User";
    ReportTargetTypeEnum["POST"] = "Post";
    ReportTargetTypeEnum["CHAT"] = "Chat";
    ReportTargetTypeEnum["COMMENT"] = "Comment";
    ReportTargetTypeEnum["MESSAGE"] = "Message";
})(ReportTargetTypeEnum || (ReportTargetTypeEnum = {}));
