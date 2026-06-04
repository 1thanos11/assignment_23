export var JobEnum;
(function (JobEnum) {
    JobEnum["SEND_EMAIL"] = "Send_Email";
    JobEnum["SEND_NOTIFICATION"] = "Send_Notification";
    JobEnum["SEND_MULTIPLE_NOTIFICATIONS"] = "Send_Notifications";
    JobEnum["UPLOAD_POST_MEDIA"] = "Upload_Post_Media";
    JobEnum["S3_DELETE_ASSETS"] = "S3_Delete_Assets";
    JobEnum["UPDATE_POST_MEDIA"] = "Update_Post_Media";
    JobEnum["UPLOAD_COMMENT_MEDIA"] = "Upload_Comment_Media";
    JobEnum["UPDATE_COMMENT_MEDIA"] = "Update_Comment_Media";
    JobEnum["CREATE_INVITATION_MESSAGES"] = "Create_Invitation_Messages";
    JobEnum["BLOCK"] = "Block";
    JobEnum["FOLLOW"] = "Follow";
})(JobEnum || (JobEnum = {}));
