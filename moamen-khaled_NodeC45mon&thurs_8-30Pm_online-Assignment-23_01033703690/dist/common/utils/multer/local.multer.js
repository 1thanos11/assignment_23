import multer from "multer";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { fileFilter } from "./validation.js";
export const localFileUpload = ({ customPath, validation, maxSize = 5, }) => {
    const storage = multer.diskStorage({
        destination(req, file, callback) {
            const fullPath = resolve(`../uploads/${customPath}`);
            if (!existsSync(fullPath)) {
                mkdirSync(fullPath, { recursive: true });
            }
            callback(null, fullPath);
        },
        filename(req, file, callback) {
            const uniqueName = `${randomUUID()}_${file.originalname}`;
            file.finalPath = `../uploads/${customPath}/${uniqueName}`;
            callback(null, uniqueName);
        },
    });
    return multer({
        fileFilter: fileFilter(validation),
        storage,
        limits: { fileSize: maxSize * 1024 * 1024 },
    });
};
