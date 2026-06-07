import { GraphQLObjectType } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";
class ReportGraphQLType {
    graphType = graphQLTypes;
    report = new GraphQLObjectType({
        name: "reportType",
        fields: { message: { type: this.graphType.messageType } },
    });
    openReport = new GraphQLObjectType({
        name: "openReportType",
        fields: {
            message: { type: this.graphType.messageType },
            data: { type: this.graphType.oneReportType },
        },
    });
    openModerationCase = new GraphQLObjectType({
        name: "openModerationCaseType",
        fields: {
            message: { type: this.graphType.messageType },
            data: { type: this.graphType.oneModerationCaseType },
        },
    });
    reviewModerationCaseType = new GraphQLObjectType({
        name: "reviewModerationCaseType",
        fields: {
            message: { type: this.graphType.messageType },
            data: { type: this.graphType.oneModerationCaseType },
        },
    });
    takeActionForModerationCase = new GraphQLObjectType({
        name: "takeActionForModerationCase",
        fields: {
            message: { type: this.graphType.messageType },
        },
    });
}
export const reportGraphQLType = new ReportGraphQLType();
