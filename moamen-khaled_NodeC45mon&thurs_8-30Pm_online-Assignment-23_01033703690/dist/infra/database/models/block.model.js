import { model, Schema, Types } from "mongoose";
const blockSchema = new Schema({
    blockerId: { type: Types.ObjectId, ref: "User", required: true },
    blockedId: { type: Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
blockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });
export const Block = model("Block", blockSchema);
