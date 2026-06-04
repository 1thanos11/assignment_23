import { GraphQLObjectType } from "graphql";
import { graphQLTypes } from "../../../gql/types.gql.js";
class SettingsGraphQLType {
    graphQLType = graphQLTypes;
    settings = new GraphQLObjectType({
        name: "updateSettingsGraphQLType",
        fields: {
            message: { type: this.graphQLType.messageType },
            data: { type: this.graphQLType.oneSettingsType },
        },
    });
}
export const settingsGraphQLType = new SettingsGraphQLType();
