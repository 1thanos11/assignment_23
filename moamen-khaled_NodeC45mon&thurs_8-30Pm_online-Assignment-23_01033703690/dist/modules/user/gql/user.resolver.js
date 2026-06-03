import { TokenTypeEnum } from "../../../common/enums/security.enums.js";
import { redisService } from "../../../common/services/redis.service.js";
import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { graphQlRateLimit } from "../../../middlewares/rateLimit/gql.rateLimit.js";
import { userService } from "../user.service.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { userValidationSchema } from "../user.validation.js";
class UserResolver {
    userService = userService;
    redis = redisService;
    userValidation = userValidationSchema;
    refreshToken = async (parent, args, context) => {
        const { user, decode } = await GQLAuthentication({
            context,
            tokenType: TokenTypeEnum.REFRESH,
        });
        const key = this.redis.userRateLimitKey({
            userId: user._id,
            path: `refreshToken`,
        });
        await graphQlRateLimit({ key, limit: 30, windowMs: 60 * 1000 });
        const data = await this.userService.refreshToken({
            user,
            decode: decode,
        });
        return { data };
    };
    logout = async (parent, { flag }, context) => {
        const { user, decode } = await GQLAuthentication({ context });
        await GQLValidate({
            schema: this.userValidation.logout,
            args: { flag },
        });
        const message = await this.userService.logout({
            user,
            decode: decode,
            flag,
        });
        return message;
    };
}
export const userResolver = new UserResolver();
