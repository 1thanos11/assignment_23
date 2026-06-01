import { ZodType } from "zod";
import { BadRequestError, ValidationError, } from "../common/errors/client.errors.js";
import { GQLError } from "../common/errors/gql.errors.js";
export const restFullApiValidate = (schema) => {
    return async (req, res, next) => {
        const issues = [];
        for (const key of Object.keys(schema)) {
            if (!key)
                continue;
            const validationResult = schema[key]?.safeParse(req[key]);
            if (validationResult && validationResult.success) {
                req[key] = validationResult.data;
            }
            if (validationResult && !validationResult.success) {
                const error = validationResult.error;
                issues.push({
                    key,
                    issues: error.issues.map((issue) => ({
                        message: issue.message,
                        path: issue.path,
                    })),
                });
            }
        }
        if (issues.length) {
            throw new BadRequestError("Validation Error", { issues });
        }
        next();
    };
};
export const GQLValidate = async ({ schema, args, }) => {
    const validationResult = schema.safeParse(args);
    if (!validationResult.success) {
        throw GQLError(new ValidationError("Validation Error", {
            issues: validationResult.error.issues.map((issue) => {
                return { path: issue.path, message: issue.message };
            }),
        }));
    }
    return true;
};
export const socketValidate = async ({ schema, args, }) => {
    const validationResult = schema.safeParse(args);
    if (!validationResult.success) {
        new ValidationError("Validation Error", {
            issues: validationResult.error.issues.map((issue) => {
                return { path: issue.path, message: issue.message };
            }),
        });
    }
    return true;
};
