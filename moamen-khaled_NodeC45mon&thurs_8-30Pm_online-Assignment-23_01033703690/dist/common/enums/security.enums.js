export var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum["ACCESS"] = "Access";
    TokenTypeEnum["REFRESH"] = "Refresh";
})(TokenTypeEnum || (TokenTypeEnum = {}));
export var KeyGeneratorEnum;
(function (KeyGeneratorEnum) {
    KeyGeneratorEnum[KeyGeneratorEnum["IP"] = 0] = "IP";
    KeyGeneratorEnum[KeyGeneratorEnum["USER"] = 1] = "USER";
    KeyGeneratorEnum[KeyGeneratorEnum["EMAIL"] = 2] = "EMAIL";
})(KeyGeneratorEnum || (KeyGeneratorEnum = {}));
export var EmailEnum;
(function (EmailEnum) {
    EmailEnum["CONFIRM_EMAIL"] = "Confirm_Email";
    EmailEnum["FORGOT_PASSWORD"] = "Forgot_Password";
})(EmailEnum || (EmailEnum = {}));
export var LogoutFlagEnum;
(function (LogoutFlagEnum) {
    LogoutFlagEnum["ALL"] = "All";
    LogoutFlagEnum["ONE"] = "One";
})(LogoutFlagEnum || (LogoutFlagEnum = {}));
