import { redisService } from "../../../common/services/redis.service.js";
import { graphQlRateLimit } from "../../../middlewares/rateLimit/gql.rateLimit.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { authService } from "../auth.service.js";
import { authValidationSchema } from "../auth.validation.js";
class AuthGraphQlResolver {
    authService = authService;
    authSchema = authValidationSchema;
    redis = redisService;
    signup = async (parent, { username, email, password, phone, gender, DOB, countryCode }) => {
        const key = this.redis.emailRateLimitKey({
            email,
            path: `signup`,
        });
        await graphQlRateLimit({ key, limit: 1, windowMs: 60 * 1000 });
        await GQLValidate({
            schema: this.authSchema.signup,
            args: { username, email, password, phone, gender, DOB, countryCode },
        });
        const { message, data } = await this.authService.signup({
            username,
            email,
            password,
            phone,
            gender,
            DOB,
            countryCode: countryCode,
        });
        return { message, data };
    };
    resendConfirmEmailOtp = async (parent, { email }) => {
        const key = this.redis.emailRateLimitKey({
            email,
            path: `resendConfirmEmailOtp`,
        });
        await graphQlRateLimit({ key, limit: 1, windowMs: 60 * 1000 });
        await GQLValidate({
            schema: this.authSchema.resendConfirmEmailOtp,
            args: { email },
        });
        const { message } = await this.authService.resendConfirmEmailOtp({ email });
        return { message };
    };
    confirmEmail = async (parent, { email, otp }) => {
        const key = this.redis.emailRateLimitKey({
            email,
            path: `confirmEmail`,
        });
        await graphQlRateLimit({ key, limit: 5, windowMs: 60 * 10 * 1000 });
        await GQLValidate({
            schema: this.authSchema.confirmEmail,
            args: { email, otp },
        });
        const { message, data } = await this.authService.confirmEmail({
            email,
            otp,
        });
        return { message, data };
    };
    login = async (parent, { email, password, FCM }, context) => {
        const key = this.redis.ipRateLimitKey({
            ip: context.req.raw.ip,
            path: `login`,
        });
        await graphQlRateLimit({ key, limit: 3, windowMs: 60 * 10 * 1000 });
        await GQLValidate({
            schema: this.authSchema.login,
            args: { email, password, FCM },
        });
        const { message, data } = await this.authService.login({
            email,
            password,
            FCM,
        });
        return { message, data };
    };
    forgotPassword = async (parent, { email }) => {
        const key = this.redis.emailRateLimitKey({
            email,
            path: `forgotPassword`,
        });
        await graphQlRateLimit({ key, limit: 1, windowMs: 60 * 1000 });
        await GQLValidate({
            schema: this.authSchema.forgotPassword,
            args: { email },
        });
        const message = await this.authService.forgotPassword({ email });
        return message;
    };
    resetPassword = async (parent, { otp, email, password, confirmPassword }) => {
        const key = this.redis.emailRateLimitKey({ email, path: `resetPassword` });
        await graphQlRateLimit({ key, limit: 3, windowMs: 60 * 1000 });
        await GQLValidate({
            schema: this.authSchema.resetPassword,
            args: { otp, email, password, confirmPassword },
        });
        const message = await this.authService.resetPassword({
            otp,
            email,
            password,
            confirmPassword,
        });
        return message;
    };
}
export const authGraphQlResolver = new AuthGraphQlResolver();
