import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString, } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";
class FollowGraphQLType {
    graphQLType = graphQLTypes;
    follow = new GraphQLObjectType({
        name: "followUserType",
        fields: {
            message: { type: this.graphQLType.messageType },
            data: { type: new GraphQLNonNull(GraphQLString) },
        },
    });
    unFollow = new GraphQLObjectType({
        name: "unFollowUserType",
        fields: {
            message: { type: this.graphQLType.messageType },
        },
    });
    followRequest = new GraphQLObjectType({
        name: "followRequestType",
        fields: {
            message: { type: this.graphQLType.messageType },
        },
    });
    followersList = new GraphQLObjectType({
        name: "followersListType",
        fields: {
            message: { type: this.graphQLType.messageType },
            data: { type: new GraphQLList(this.graphQLType.oneFollowersListType) },
        },
    });
    followingList = new GraphQLObjectType({
        name: "followingListType",
        fields: {
            message: { type: this.graphQLType.messageType },
            data: { type: new GraphQLList(this.graphQLType.oneFollowingListType) },
        },
    });
    followRequestsList = new GraphQLObjectType({
        name: "followRequestsListType",
        fields: {
            message: { type: this.graphQLType.messageType },
            data: {
                type: new GraphQLList(this.graphQLType.oneFollowRequestsListType),
            },
        },
    });
}
export const followGraphQLType = new FollowGraphQLType();
