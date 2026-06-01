import { PaginateDefault } from "../../common/constants/paginate.constants.js";
export class DataBaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return (await this.model.create(data, options));
    }
    async createOne({ data, options, }) {
        const [doc] = await this.create({ data: [data], options });
        return doc;
    }
    async find({ filter, projection, options, }) {
        return await this.model.find(filter, projection, options);
    }
    async findOne({ filter, projection, options, }) {
        return await this.model.findOne(filter, projection, options);
    }
    async findOneAndUpdate({ filter, update, options, }) {
        if (Array.isArray(update)) {
            return await this.model.findOneAndUpdate(filter, [...update, { $set: { __v: { $add: ["$__v", 1] } } }], {
                ...options,
                returnDocument: "after",
                runValidators: true,
                updatePipeline: true,
            });
        }
        return await this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, {
            ...options,
            returnDocument: "after",
            runValidators: true,
        });
    }
    async findOneAndDelete({ filter, options, }) {
        return await this.model.findOneAndDelete(filter, options);
    }
    async findById({ id, projection, options, }) {
        return await this.model.findById(id, projection, options);
    }
    async findByIdAndUpdate({ id, update, options, }) {
        return await this.model.findByIdAndUpdate(id, update, {
            ...options,
            returnDocument: "after",
        });
    }
    async findByIdAndDelete({ id, options, }) {
        return await this.model.findByIdAndDelete(id, options);
    }
    async countDocuments({ filter, options, }) {
        return await this.model.countDocuments(filter, options);
    }
    async paginate({ filter, projection, options, page = PaginateDefault.PAGE, limit = PaginateDefault.LIMIT, }) {
        page = Math.max(1, Math.floor(page));
        limit = Math.min(100, Math.max(1, Math.floor(limit)));
        const skip = (page - 1) * limit;
        const [data, totalDocs] = await Promise.all([
            this.find({
                filter,
                projection,
                options: { ...options, skip, limit },
            }),
            this.countDocuments({ filter }),
        ]);
        const totalPages = Math.ceil(totalDocs / limit);
        return {
            data,
            meta: {
                totalPages,
                totalDocs,
                currentPage: page,
                limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
    async updateOne({ filter, update, options, }) {
        if (Array.isArray(update)) {
            return await this.model.updateOne(filter, [...update, { $set: { __v: { $add: ["$__v", 1] } } }], {
                ...options,
                runValidators: true,
                updatePipeline: true,
            });
        }
        return await this.model.updateOne(filter, update, {
            ...options,
            runValidators: true,
        });
    }
    async updateMany({ filter, update, options, }) {
        return await this.model.updateMany(filter, update, options);
    }
    async deleteOne({ filter, options, }) {
        return await this.model.deleteOne(filter, options);
    }
    async deleteMany({ filter, options, }) {
        return await this.model.deleteMany(filter, options);
    }
    async insertMany({ docs, options, }) {
        return (await this.model.insertMany(docs, options));
    }
}
