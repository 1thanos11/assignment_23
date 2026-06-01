import { GraphQLNonNull, GraphQLString } from "graphql";
import { GQLGenderEnum } from "../../../common/enums/gql.enums.js";
class AuthGraphQlArgs {
    signup = {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLString },
        countryCode: { type: GraphQLString },
        username: { type: new GraphQLNonNull(GraphQLString) },
        gender: { type: new GraphQLNonNull(GQLGenderEnum) },
        DOB: { type: new GraphQLNonNull(GraphQLString) },
    };
    resendConfirmEmailOtp = {
        email: { type: new GraphQLNonNull(GraphQLString) },
    };
    confirmEmail = {
        email: { type: new GraphQLNonNull(GraphQLString) },
        otp: { type: new GraphQLNonNull(GraphQLString) },
    };
    login = {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        FCM: { type: GraphQLString },
    };
    forgotPassword = {
        email: { type: new GraphQLNonNull(GraphQLString) },
    };
    resetPassword = {
        otp: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        confirmPassword: { type: new GraphQLNonNull(GraphQLString) },
    };
}
export const authGraphQlArgs = new AuthGraphQlArgs();
