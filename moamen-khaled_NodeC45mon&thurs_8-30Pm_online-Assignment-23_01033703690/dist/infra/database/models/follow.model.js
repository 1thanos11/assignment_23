import { model, Schema, Types } from "mongoose";
import { FollowStatusEnum } from "../../../common/enums/follow.enums.js";
const followSchema = new Schema({
    followerId: { type: Types.ObjectId, ref: "User", required: true },
    followingId: { type: Types.ObjectId, ref: "User", required: true },
    followStatus: {
        type: String,
        enum: FollowStatusEnum,
        default: FollowStatusEnum.ACCEPTED,
    },
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
export const Follow = model("Follow", followSchema);
