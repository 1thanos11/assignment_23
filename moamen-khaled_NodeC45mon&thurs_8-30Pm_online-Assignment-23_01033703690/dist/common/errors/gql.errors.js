import { GraphQLError } from "graphql";
export const GQLError = (error) => {
    throw new GraphQLError(error.message, {
        extensions: { status: error.status, cause: error.cause },
    });
};
