import { BadRequestError } from "../../errors/index.js";
import mime from "mime-types";
export const fileFilterValidation = {
    image: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    video: ["video/mp4", "video/mpeg", "video/quicktime"],
};
export const fileFilter = (validation) => {
    return (req, file, callback) => {
        const mimetype = mime.lookup(file.originalname) || file.mimetype;
        if (!validation.includes(mimetype)) {
            return callback(new BadRequestError(`invalid file format the allowed formats are ${validation.join(", ")} only`));
        }
        return callback(null, true);
    };
};
