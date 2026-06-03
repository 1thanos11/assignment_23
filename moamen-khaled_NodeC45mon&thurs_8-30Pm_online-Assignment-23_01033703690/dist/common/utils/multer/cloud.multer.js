import multer from "multer";
import { StorageEnum } from "../../enums/s3.enums.js";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { fileFilter } from "./validation.js";
export const cloudFileUpload = ({ storageType = StorageEnum.MEMORY, validation, maxSize = 5, }) => {
    const storage = storageType === StorageEnum.MEMORY
        ? multer.memoryStorage()
        : multer.diskStorage({
            destination(req, file, callback) {
                callback(null, tmpdir());
            },
            filename(req, file, callback) {
                const fileName = `${randomUUID()}_${file.originalname}`;
                callback(null, fileName);
            },
        });
    return multer({
        fileFilter: fileFilter(validation),
        storage,
        limits: { fileSize: maxSize * 1024 * 1024 },
    });
};
