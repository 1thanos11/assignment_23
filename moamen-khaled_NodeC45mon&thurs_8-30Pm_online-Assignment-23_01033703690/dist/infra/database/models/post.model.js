import { PostStatusEnum, PostVisibilityEnum, } from "../../../common/enums/post.enums.js";
import { model, Schema, Types } from "mongoose";
const postSchema = new Schema({
    authorId: { type: Types.ObjectId, ref: "User", required: true },
    folderId: String,
    content: {
        type: String,
        required: function () {
            return !this.media;
        },
    },
    media: [String],
    postVisibility: {
        type: String,
        enum: PostVisibilityEnum,
        default: PostVisibilityEnum.PUBLIC,
    },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    tags: { type: [Types.ObjectId], ref: "User" },
    mentions: { type: [Types.ObjectId], ref: "User" },
    postStatus: {
        type: String,
        enum: PostStatusEnum,
        default: PostStatusEnum.PROCESSING,
    },
    reportsCount: { type: Number, default: 0 },
    deletedAt: Date,
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
postSchema.virtual("comments", {
    localField: "_id",
    foreignField: "postId",
    ref: "Comment",
    justOne: true,
});
postSchema.pre(["find", "findOne", "findOneAndUpdate"], function () {
    const filter = this.getFilter();
    if (filter.paranoid === false) {
        delete filter.paranoid;
    }
    else if (filter.deletedOnly === true) {
        this.setQuery({ ...filter, deletedAt: { $ne: null } });
    }
    else {
        this.setQuery({ ...filter, deletedAt: null });
    }
});
postSchema.pre(["updateOne", "updateMany"], function () {
    const filter = this.getFilter();
    if (filter.paranoid === false) {
        delete filter.paranoid;
    }
    else if (filter.deletedOnly === true) {
        this.setQuery({ ...filter, deletedAt: { $ne: null } });
    }
    else {
        this.setQuery({ ...filter, deletedAt: null });
    }
});
export const Post = model("Post", postSchema);
