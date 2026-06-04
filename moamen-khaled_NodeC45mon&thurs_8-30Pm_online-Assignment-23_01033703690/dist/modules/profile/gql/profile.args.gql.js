import { GraphQLID, GraphQLNonNull } from "graphql";
class ProfileGraphQLArgs {
    getProfileById = { targetId: { type: new GraphQLNonNull(GraphQLID) } };
}
export const profileGraphQLArgs = new ProfileGraphQLArgs();
