import { GraphQLList, GraphQLObjectType } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";
class GraphQLCommentType {
    graphQLTypes = graphQLTypes;
    getComment = new GraphQLObjectType({
        name: `getCommentType`,
        fields: {
            message: { type: this.graphQLTypes.messageType },
            data: { type: this.graphQLTypes.oneCommentType },
        },
    });
    commentsList = new GraphQLObjectType({
        name: `commentsList`,
        fields: {
            message: { type: this.graphQLTypes.messageType },
            data: {
                type: new GraphQLObjectType({
                    name: `commentsListType`,
                    fields: {
                        data: { type: new GraphQLList(this.graphQLTypes.oneCommentType) },
                        meta: { type: this.graphQLTypes.onePaginationMetaType },
                    },
                }),
            },
        },
    });
}
export const graphQLCommentType = new GraphQLCommentType();
