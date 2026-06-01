import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client, } from "@aws-sdk/client-s3";
import { APPLICATION_NAME, AWS_ACCESS_KEY_ID, AWS_BUCKET_NAME, AWS_EXPIRES_IN, AWS_REGION, AWS_SECRET_ACCESS_KEY, } from "../../config/config.js";
import { StorageEnum, UploadEnum } from "../enums/s3.enums.js";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { BadRequestError } from "../errors/client.errors.js";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { InternalServerError } from "../errors/server.errors.js";
class S3Service {
    client;
    constructor() {
        this.client = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    async uploadAsset({ storage = StorageEnum.MEMORY, Bucket = AWS_BUCKET_NAME, path = "general", file, ACL = ObjectCannedACL.private, ContentType, }) {
        const command = new PutObjectCommand({
            Bucket,
            Key: `${APPLICATION_NAME}/${path}/${randomUUID()}/${file.originalname}`,
            Body: storage === StorageEnum.MEMORY
                ? file.buffer
                : createReadStream(file.path),
            ACL,
            ContentType: file.mimetype || ContentType,
        });
        if (!command.input.Key) {
            throw new BadRequestError("Fail to upload this asset");
        }
        await this.client.send(command);
        return command.input.Key;
    }
    async uploadLargeAsset({ storage = StorageEnum.MEMORY, Bucket = AWS_BUCKET_NAME, path = "general", file, ACL = ObjectCannedACL.private, ContentType, partSize = 5, queueSize = 4, leavePartsOnError = false, }) {
        const upload = new Upload({
            client: this.client,
            params: {
                Bucket,
                Key: `${APPLICATION_NAME}/${path}/${randomUUID()}/${file.originalname}`,
                Body: storage === StorageEnum.MEMORY
                    ? file.buffer
                    : createReadStream(file.path),
                ACL,
                ContentType: file.mimetype || ContentType,
            },
            partSize: partSize * 1024 * 1024,
            queueSize,
            leavePartsOnError,
        });
        return await upload.done();
    }
    async uploadAssets({ storage, upload, Bucket = AWS_BUCKET_NAME, path = "general", files, ACL = ObjectCannedACL.private, ContentType, partSize = 5, queueSize = 4, leavePartsOnError = false, }) {
        let urls = [];
        if (upload === UploadEnum.LARGE) {
            const data = await Promise.all(files.map((file) => {
                return this.uploadLargeAsset({
                    storage,
                    Bucket,
                    path,
                    file,
                    ACL,
                    ContentType,
                    partSize: partSize * 1024 * 1024,
                    queueSize,
                    leavePartsOnError,
                });
            }));
            urls = data.map((ele) => {
                return ele.Key;
            });
        }
        else {
            urls = await Promise.all(files.map((file) => {
                return this.uploadAsset({
                    storage,
                    Bucket,
                    path,
                    file,
                    ACL,
                    ContentType,
                });
            }));
        }
        if (urls.length === 0) {
            throw new InternalServerError("Failed to upload assets");
        }
        return urls;
    }
    async getAsset({ Bucket = AWS_BUCKET_NAME, Key, }) {
        const command = new GetObjectCommand({ Bucket, Key });
        return this.client.send(command);
    }
    async createPreSignedUploadUrl({ Bucket = AWS_BUCKET_NAME, path = "general", originalname, ContentType, expiresIn = AWS_EXPIRES_IN, }) {
        const command = new PutObjectCommand({
            Bucket,
            Key: `${APPLICATION_NAME}/${path}/${randomUUID()}/${originalname}`,
            ContentType,
        });
        if (!command.input.Key) {
            throw new BadRequestError("Fail to upload this asset");
        }
        const url = await getSignedUrl(this.client, command, { expiresIn });
        return { url, Key: command.input.Key };
    }
    async createPreSignedUrlFetchLink({ Bucket = AWS_BUCKET_NAME, Key, fileName, download, expiresIn = AWS_EXPIRES_IN, }) {
        const command = new GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download === "true"
                ? fileName ||
                    `attachment; filename="${fileName || Key.split("/").pop()}"`
                : undefined,
        });
        const url = await getSignedUrl(this.client, command, { expiresIn });
        return url;
    }
    async deleteAsset({ Bucket = AWS_BUCKET_NAME, Key, }) {
        const command = new DeleteObjectCommand({ Bucket, Key });
        return await this.client.send(command);
    }
    async deleteAssets({ Bucket = AWS_BUCKET_NAME, Keys, }) {
        const command = new DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects: Keys,
                Quiet: false,
            },
        });
        return await this.client.send(command);
    }
    async listFolderDir({ Bucket = AWS_BUCKET_NAME, prefix, }) {
        const command = new ListObjectsV2Command({
            Bucket,
            Prefix: `${APPLICATION_NAME}/${prefix}`,
        });
        return await this.client.send(command);
    }
}
export const s3Service = new S3Service();
