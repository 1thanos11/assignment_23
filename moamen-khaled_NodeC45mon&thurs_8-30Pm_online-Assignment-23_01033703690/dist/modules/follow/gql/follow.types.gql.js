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
}
export const followGraphQLType = new FollowGraphQLType();
