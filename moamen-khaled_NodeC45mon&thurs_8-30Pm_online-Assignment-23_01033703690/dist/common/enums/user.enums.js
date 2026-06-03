export var RoleEnum;
(function (RoleEnum) {
    RoleEnum["USER"] = "User";
    RoleEnum["ADMIN"] = "Admin";
    RoleEnum["MODERATOR"] = "Moderator";
    RoleEnum["SUPER_ADMIN"] = "Super_Admin";
})(RoleEnum || (RoleEnum = {}));
export var UserStatusEnum;
(function (UserStatusEnum) {
    UserStatusEnum["ACTIVE"] = "Active";
    UserStatusEnum["DEACTIVATED"] = "Deactivated";
    UserStatusEnum["DELETED"] = "Deleted";
    UserStatusEnum["BANNED"] = "Banned";
})(UserStatusEnum || (UserStatusEnum = {}));
export var ProviderEnum;
(function (ProviderEnum) {
    ProviderEnum["SYSTEM"] = "System";
    ProviderEnum["GOOGLE"] = "Google";
})(ProviderEnum || (ProviderEnum = {}));
export var DeactivatedReasonEnum;
(function (DeactivatedReasonEnum) {
    DeactivatedReasonEnum["FAKE_NAME"] = "FAKE_NAME";
    DeactivatedReasonEnum["COMMUNITY_STANDARDS_VIOLATION"] = "COMMUNITY_STANDARDS_VIOLATION";
    DeactivatedReasonEnum["SPAM_OR_SUSPICIOUS_ACTIVITY"] = "SPAM_OR_SUSPICIOUS_ACTIVITY";
    DeactivatedReasonEnum["FAKE_ACCOUNT"] = "FAKE_ACCOUNT";
    DeactivatedReasonEnum["SCAM_OR_FRAUD"] = "SCAM_OR_FRAUD";
    DeactivatedReasonEnum["COPYRIGHT_VIOLATION"] = "COPYRIGHT_VIOLATION";
    DeactivatedReasonEnum["ILLEGAL_CONTENT"] = "ILLEGAL_CONTENT";
    DeactivatedReasonEnum["SECURITY_ISSUE"] = "SECURITY_ISSUE";
    DeactivatedReasonEnum["UNDERAGE_USER"] = "UNDERAGE_USER";
    DeactivatedReasonEnum["REPEATED_VIOLATIONS"] = "REPEATED_VIOLATIONS";
    DeactivatedReasonEnum["AUTOMATION_ABUSE"] = "AUTOMATION_ABUSE";
    DeactivatedReasonEnum["MISINFORMATION"] = "MISINFORMATION";
    DeactivatedReasonEnum["MARKETPLACE_VIOLATION"] = "MARKETPLACE_VIOLATION";
    DeactivatedReasonEnum["ADS_POLICY_VIOLATION"] = "ADS_POLICY_VIOLATION";
    DeactivatedReasonEnum["IDENTITY_VERIFICATION_FAILED"] = "IDENTITY_VERIFICATION_FAILED";
    DeactivatedReasonEnum["USER_REQUESTED"] = "USER_REQUESTED";
    DeactivatedReasonEnum["OTHER"] = "OTHER";
})(DeactivatedReasonEnum || (DeactivatedReasonEnum = {}));
