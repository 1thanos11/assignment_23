import { s3Service } from "../../../common/services/s3.service.js";
import { CommentRepository, PostRepository } from "../../repository/index.js";
import { StorageEnum, UploadEnum } from "../../../common/enums/s3.enums.js";
import { BadRequestError } from "../../../common/errors/client.errors.js";
import { PostStatusEnum } from "../../../common/enums/post.enums.js";
class S3Process {
    s3 = s3Service;
    postRepository;
    commentRepository;
    constructor() {
        this.postRepository = new PostRepository();
        this.commentRepository = new CommentRepository();
    }
    async uploadAssets({ files, folderId, }) {
        const urls = await Promise.all(files.map(async (file) => {
            if (file.size > 5) {
                return await this.s3.uploadAssets({
                    storage: StorageEnum.DISK,
                    upload: UploadEnum.LARGE,
                    files: [file],
                    path: `Post/${folderId}`,
                });
            }
            else {
                return await this.s3.uploadAssets({
                    storage: StorageEnum.MEMORY,
                    upload: UploadEnum.SMALL,
                    files: [file],
                    path: `Post/${folderId}`,
                });
            }
        }));
        return urls.flat();
    }
    async processPostMedia({ userId, postId, folderId, files, }) {
        try {
            const urls = await this.uploadAssets({ files, folderId });
            if (urls.length <= 0) {
                throw new BadRequestError(`Fail to upload this assets`);
            }
            await this.postRepository.findOneAndUpdate({
                filter: { _id: postId, authorId: userId },
                update: { $set: { media: urls, postStatus: PostStatusEnum.PUBLISHED } },
            });
        }
        catch (error) {
            await this.postRepository.findOneAndUpdate({
                filter: { _id: postId, authorId: userId },
                update: { $set: { postStatus: PostStatusEnum.FAILED } },
            });
            throw error;
        }
    }
    async processUpdatePostMedia({ userId, postId, folderId, files, removeFiles, }) {
        try {
            const urls = await this.uploadAssets({ files, folderId });
            if (urls.length <= 0) {
                throw new BadRequestError(`Fail to upload this assets`);
            }
            await this.postRepository.findOneAndUpdate({
                filter: { _id: postId, authorId: userId },
                update: [
                    {
                        $set: {
                            postStatus: PostStatusEnum.PUBLISHED,
                            media: {
                                $setUnion: [
                                    {
                                        $setDifference: [
                                            { $ifNull: ["$media", []] },
                                            removeFiles ?? [],
                                        ],
                                    },
                                    urls,
                                ],
                            },
                        },
                    },
                ],
            });
        }
        catch (error) {
            throw error;
        }
    }
    async updateCommentMedia({ userId, postId, commentId, files, removeFiles, folderId, }) {
        try {
            const urls = await this.uploadAssets({ files, folderId });
            if (urls.length <= 0) {
                throw new BadRequestError(`Fail to upload this assets`);
            }
            await this.commentRepository.findOneAndUpdate({
                filter: { _id: commentId, postId, authorId: userId },
                update: {
                    $set: {
                        media: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        { $ifNull: ["$media", []] },
                                        removeFiles ?? [],
                                    ],
                                },
                                urls,
                            ],
                        },
                    },
                },
            });
        }
        catch (error) {
            throw error;
        }
    }
}
export const s3Process = new S3Process();
