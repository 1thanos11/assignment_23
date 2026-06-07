import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphQLReportActionEnum, GraphQLReportReasonEnum, GraphQLReportStatusEnum, GraphQLReportTargetTypeEnum, } from "../../../common/enums/gql.enums.js";
class ReportGraphQLArgs {
    report = {
        targetId: { type: new GraphQLNonNull(GraphQLID) },
        targetType: { type: new GraphQLNonNull(GraphQLReportTargetTypeEnum) },
        reason: { type: new GraphQLNonNull(GraphQLReportReasonEnum) },
        customReason: { type: GraphQLString },
        snapshot: { type: GraphQLString },
    };
    openReport = { reportId: { type: new GraphQLNonNull(GraphQLID) } };
    openModerationCase = {
        moderationCaseId: { type: new GraphQLNonNull(GraphQLID) },
    };
    takeActionForModerationCase = {
        moderationCaseId: { type: new GraphQLNonNull(GraphQLID) },
        action: { type: GraphQLReportActionEnum },
        customAction: { type: GraphQLString },
        status: { type: new GraphQLNonNull(GraphQLReportStatusEnum) },
    };
}
export const reportGraphQLArgs = new ReportGraphQLArgs();
