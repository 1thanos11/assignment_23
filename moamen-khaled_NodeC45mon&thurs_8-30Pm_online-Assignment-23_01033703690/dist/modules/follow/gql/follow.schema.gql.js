import { GraphQLString } from "graphql";
import { followGraphQLType } from "./follow.types.gql.js";
import { followGraphQLArgs } from "./follow.args.gql.js";
import { followResolver } from "./follow.resolver.js";
class FollowGraphQLSchema {
    followGraphQLType = followGraphQLType;
    followGraphQLArgs = followGraphQLArgs;
    followResolver = followResolver;
    registerQuery() {
        return {
            dummyFollow: {
                description: "Dummy query for testing",
                type: GraphQLString,
                resolve: () => "Follow module is working 🚀",
            },
        };
    }
    registerMutation() {
        return {
            follow: {
                description: "follow user",
                type: this.followGraphQLType.follow,
                args: this.followGraphQLArgs.follow,
                resolve: this.followResolver.follow,
            },
            unFollow: {
                description: "un follow user",
                type: this.followGraphQLType.unFollow,
                args: this.followGraphQLArgs.follow,
                resolve: this.followResolver.unFollow,
            },
            rejectFollowRequest: {
                description: "reject follow request",
                type: this.followGraphQLType.followRequest,
                args: this.followGraphQLArgs.follow,
                resolve: this.followResolver.rejectFollowRequest,
            },
            acceptFollowRequest: {
                description: "accept follow request",
                type: this.followGraphQLType.followRequest,
                args: this.followGraphQLArgs.follow,
                resolve: this.followResolver.acceptFollowRequest,
            },
            followersList: {
                description: "accept follow request",
                type: this.followGraphQLType.followersList,
                args: this.followGraphQLArgs.followersList,
                resolve: this.followResolver.followersList,
            },
        };
    }
}
export const followGraphQLSchema = new FollowGraphQLSchema();
