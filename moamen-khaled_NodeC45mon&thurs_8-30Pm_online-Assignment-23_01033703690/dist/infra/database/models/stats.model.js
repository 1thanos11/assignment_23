import { model, Schema, Types } from "mongoose";
const statsSchema = new Schema({
    ownerId: {
        type: Types.ObjectId,
        ref: "User",
        unique: true,
        required: true,
    },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    profileViewsCount: { type: Number, default: 0 },
    totalLikesReceived: { type: Number, default: 0 },
    totalCommentsReceived: { type: Number, default: 0 },
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
export const Stats = model("Stats", statsSchema);
