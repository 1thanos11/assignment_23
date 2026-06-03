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
    ReportStatusEnum["UNDER_REVIEW"] = "UNDER_REVIEW";
    ReportStatusEnum["RESOLVED"] = "RESOLVED";
    ReportStatusEnum["REJECTED"] = "REJECTED";
})(ReportStatusEnum || (ReportStatusEnum = {}));
export var ReportActionEnum;
(function (ReportActionEnum) {
    ReportActionEnum["NONE"] = "NONE";
    ReportActionEnum["WARNED"] = "WARNED";
    ReportActionEnum["HIDDEN"] = "HIDDEN";
    ReportActionEnum["DELETED"] = "DELETED";
    ReportActionEnum["BANNED"] = "BANNED";
})(ReportActionEnum || (ReportActionEnum = {}));
export var ReportPriorityEnum;
(function (ReportPriorityEnum) {
    ReportPriorityEnum["LOW"] = "LOW";
    ReportPriorityEnum["MEDIUM"] = "MEDIUM";
    ReportPriorityEnum["HIGH"] = "HIGH";
})(ReportPriorityEnum || (ReportPriorityEnum = {}));
export var ReportTargetTypeEnum;
(function (ReportTargetTypeEnum) {
    ReportTargetTypeEnum["USER"] = "USER";
    ReportTargetTypeEnum["POST"] = "POST";
    ReportTargetTypeEnum["COMMENT"] = "COMMENT";
    ReportTargetTypeEnum["MESSAGE"] = "MESSAGE";
})(ReportTargetTypeEnum || (ReportTargetTypeEnum = {}));
