import { postGraphQLArgs } from "./post.args.gql.js";
import { postGraphQLResolver } from "./post.resolver.js";
import { postGraphQLType } from "./post.type.gql.js";
class PostGraphQLSchema {
    postType = postGraphQLType;
    postArgs = postGraphQLArgs;
    postResolver = postGraphQLResolver;
    registerQuery() {
        return {
            postList: {
                description: "posts list query schema",
                type: this.postType.postsList,
                args: this.postArgs.postsList,
                resolve: this.postResolver.postsList,
            },
            getPostById: {
                description: "get post by id query schema",
                type: this.postType.getPostById,
                args: this.postArgs.getPostById,
                resolve: this.postResolver.getPostById,
            },
        };
    }
}
export const postGraphQLSchema = new PostGraphQLSchema();
