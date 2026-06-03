import { model, Model, Schema } from "mongoose";
import { DeactivatedReasonEnum, ProviderEnum, RoleEnum, UserStatusEnum, } from "../../../common/enums/user.enums.js";
import { BadRequestError } from "../../../common/errors/client.errors.js";
import { modelHelper } from "./helperModel.js";
import { securityService } from "../../../common/services/security.service.js";
import { Comment } from "./comment.model.js";
const userSchema = new Schema({
    email: { type: String, lowercase: true, unique: true, required: true },
    password: {
        type: String,
        required: function () {
            return this.provider === ProviderEnum.SYSTEM;
        },
    },
    phone: String,
    role: { type: String, enum: RoleEnum, default: RoleEnum.USER },
    userStatus: {
        type: String,
        enum: UserStatusEnum,
        default: UserStatusEnum.ACTIVE,
    },
    provider: {
        type: String,
        enum: ProviderEnum,
        default: ProviderEnum.SYSTEM,
    },
    verifiedAt: Date,
    changeCredentialsTime: Date,
    lastLoginAt: Date,
    lastSeenAt: Date,
    bannedAt: Date,
    banReason: { type: String, maxlength: 50 },
    banCancelledAt: Date,
    deactivatedAt: Date,
    deactivatedReason: {
        type: String,
        enum: DeactivatedReasonEnum,
        required: function () {
            return !!this.deactivatedAt;
        },
    },
    reactivatedAt: Date,
    deletedAt: Date,
    restoredAt: Date,
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema.virtual("profile", {
    localField: "_id",
    foreignField: "ownerId",
    ref: "Profile",
    justOne: true,
});
userSchema.virtual("comments", {
    localField: "_id",
    foreignField: "authorId",
    ref: "Comment",
    justOne: true,
});
userSchema.pre("validate", function () {
    if (this.password && this.provider === ProviderEnum.GOOGLE) {
        throw new BadRequestError("Google account can't has password");
    }
});
userSchema.pre("save", async function () {
    if (this.password && this.isModified("password")) {
        this.password = await securityService.hash({ data: this.password });
    }
});
userSchema.pre(["find", "findOne"], function () {
    modelHelper.query(this);
});
userSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function () {
    modelHelper.query(this);
    modelHelper.update({ update: this.getUpdate(), that: this });
});
userSchema.pre(["findOneAndDelete", "deleteOne", "deleteMany"], function () {
    modelHelper.query(this);
});
userSchema.methods.comparePassword = async function (password) {
    return await securityService.compare({
        data: password,
        encrypted: this.password,
    });
};
export const User = model("User", userSchema);
