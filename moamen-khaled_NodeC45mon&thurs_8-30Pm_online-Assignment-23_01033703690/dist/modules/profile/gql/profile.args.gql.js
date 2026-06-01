import { GraphQLID } from "graphql";
class ProfileGraphQLArgs {
    getProfileById = { targetId: { type: GraphQLID } };
}
export const profileGraphQLArgs = new ProfileGraphQLArgs();
