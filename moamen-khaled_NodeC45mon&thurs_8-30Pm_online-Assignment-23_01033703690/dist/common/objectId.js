import { Types } from "mongoose";
export const toObjectId = (data) => {
    return Types.ObjectId.createFromHexString(data);
};
