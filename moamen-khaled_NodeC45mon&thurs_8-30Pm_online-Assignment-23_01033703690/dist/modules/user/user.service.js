import { ConflictError, NotFoundError, } from "../../common/errors/client.errors.js";
import { ProfileRepository, SettingsRepository, StatsRepository, UserRepository, } from "../../infra/repository/index.js";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, } from "../../config/config.js";
import { redisService } from "../../common/services/redis.service.js";
import { tokenService } from "../../common/services/token.service.js";
import { LogoutFlagEnum } from "../../common/enums/security.enums.js";
class UserService {
    userRepository;
    profileRepository;
    settingsRepository;
    statsRepository;
    redis = redisService;
    tokenService = tokenService;
    constructor() {
        this.userRepository = new UserRepository();
        this.profileRepository = new ProfileRepository();
        this.settingsRepository = new SettingsRepository();
        this.statsRepository = new StatsRepository();
    }
    async refreshToken(inputs) {
        const { user, decode } = inputs;
        if (Date.now() + 3000 >
            (decode?.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000) {
            throw new ConflictError("the previous token still valid");
        }
        const revokeTokenKey = this.redis.revokeTokenKey({
            userId: user._id,
            jti: decode?.jti,
        });
        await this.redis.set({
            key: revokeTokenKey,
            value: decode?.jti,
            options: {
                expiration: {
                    type: "EX",
                    value: decode?.iat + REFRESH_TOKEN_EXPIRES_IN,
                },
            },
        });
        user.changeCredentialsTime = new Date();
        await user.save();
        return await this.tokenService.createLoginCredentials({ user });
    }
    async logout(inputs) {
        const { user, decode, flag } = inputs;
        switch (flag) {
            case LogoutFlagEnum.ALL:
                user.changeCredentialsTime = new Date();
                user.lastSeenAt = new Date();
                await user.save();
                break;
            default:
                const key = this.redis.revokeTokenKey({
                    userId: user._id,
                    jti: decode?.jti,
                });
                await this.redis.set({
                    key,
                    value: decode?.jti,
                    options: {
                        expiration: {
                            type: "EX",
                            value: decode?.iat + REFRESH_TOKEN_EXPIRES_IN,
                        },
                    },
                });
                user.lastSeenAt = new Date();
                await user.save();
                break;
        }
        return { message: `logged out successfully` };
    }
}
export const userService = new UserService();
