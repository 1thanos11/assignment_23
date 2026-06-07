import { GraphQLString } from "graphql";
import { reportGraphQLArgs } from "./report.args.gql.js";
import { reportResolver } from "./report.resolver.js";
import { reportGraphQLType } from "./report.types.gql.js";
class ReportGraphQLSchema {
    reportType = reportGraphQLType;
    reportArgs = reportGraphQLArgs;
    reportResolver = reportResolver;
    registerQuery() {
        return {
            openReport: {
                description: `get report by id report`,
                type: this.reportType.openReport,
                args: this.reportArgs.openReport,
                resolve: this.reportResolver.openReport,
            },
            openModerationCase: {
                description: `get moderation case by id report`,
                type: this.reportType.openModerationCase,
                args: this.reportArgs.openModerationCase,
                resolve: this.reportResolver.openModerationCase,
            },
        };
    }
    registerMutation() {
        return {
            report: {
                description: `create report`,
                type: this.reportType.report,
                args: this.reportArgs.report,
                resolve: this.reportResolver.report,
            },
            takeActionForModerationCase: {
                description: `admin take action for moderation case`,
                type: this.reportType.takeActionForModerationCase,
                args: this.reportArgs.takeActionForModerationCase,
                resolve: this.reportResolver.takeActionForModerationCase,
            },
            reviewModerationCase: {
                description: `admin review moderation case`,
                type: this.reportType.reviewModerationCaseType,
                args: this.reportArgs.openModerationCase,
                resolve: this.reportResolver.reviewModerationCase,
            },
        };
    }
}
export const reportGraphQLSchema = new ReportGraphQLSchema();
