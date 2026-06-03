import jwt, {} from "jsonwebtoken";
import { RoleEnum } from "../enums/user.enums.js";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, SYSTEM_ACCESS_TOKEN_SECRET_KEY, SYSTEM_REFRESH_TOKEN_SECRET_KEY, TOKEN_ISSUER, USER_ACCESS_TOKEN_SECRET_KEY, USER_REFRESH_TOKEN_SECRET_KEY, } from "../../config/config.js";
import { randomUUID } from "node:crypto";
import { TokenTypeEnum } from "../enums/security.enums.js";
import { BadRequestError, NotFoundError, UnauthorizedError, } from "../errors/client.errors.js";
import { redisService } from "./redis.service.js";
import { UserRepository } from "../../infra/repository/index.js";
import { toObjectId } from "../objectId.js";
class TokenService {
    redis = redisService;
    userRepoRepository;
    constructor() {
        this.userRepoRepository = new UserRepository();
    }
    async getTokenSignature(role) {
        let accessSignature;
        let refreshSignature;
        if (role != RoleEnum.USER) {
            accessSignature = SYSTEM_ACCESS_TOKEN_SECRET_KEY;
            refreshSignature = SYSTEM_REFRESH_TOKEN_SECRET_KEY;
        }
        else {
            accessSignature = USER_ACCESS_TOKEN_SECRET_KEY;
            refreshSignature = USER_REFRESH_TOKEN_SECRET_KEY;
        }
        return { accessSignature, refreshSignature };
    }
    async sign({ payload, secretKey, options, }) {
        return jwt.sign(payload, secretKey, options);
    }
    async createLoginCredentials({ user, issuer = TOKEN_ISSUER, }) {
        const { accessSignature, refreshSignature } = await this.getTokenSignature(user.role);
        const jwtid = randomUUID();
        const accessToken = await this.sign({
            payload: { sub: user._id.toString() },
            secretKey: accessSignature,
            options: {
                issuer,
                expiresIn: ACCESS_TOKEN_EXPIRES_IN,
                audience: [TokenTypeEnum.ACCESS, user.role],
                jwtid,
            },
        });
        const refreshToken = await this.sign({
            payload: { sub: user._id.toString() },
            secretKey: refreshSignature,
            options: {
                issuer,
                expiresIn: REFRESH_TOKEN_EXPIRES_IN,
                audience: [TokenTypeEnum.REFRESH, user.role],
                jwtid,
            },
        });
        return { accessToken, refreshToken };
    }
    async decode({ token, options, }) {
        return jwt.decode(token, options);
    }
    async verify({ token, secretKey, options, }) {
        return jwt.verify(token, secretKey, options);
    }
    async authenticateToken({ token, tokenType = TokenTypeEnum.ACCESS, }) {
        const decode = await this.decode({ token });
        const [audTokenType, role] = decode.aud;
        if (audTokenType !== tokenType) {
            throw new BadRequestError(`invalid token type as we expect ${tokenType} and you pass ${audTokenType}`);
        }
        const { accessSignature, refreshSignature } = await this.getTokenSignature(role);
        const secretKey = tokenType === TokenTypeEnum.ACCESS ? accessSignature : refreshSignature;
        const verifiedData = await this.verify({
            token,
            secretKey,
            options: { issuer: TOKEN_ISSUER },
        });
        if (!verifiedData) {
            throw new UnauthorizedError("this token hasn't created by our server");
        }
        const revokeTokenKey = this.redis.revokeTokenKey({
            userId: toObjectId(verifiedData.sub),
            jti: verifiedData.jti,
        });
        const isRevoked = await this.redis.get(revokeTokenKey);
        if (isRevoked) {
            throw new BadRequestError("please login first");
        }
        const user = await this.userRepoRepository.findOne({
            filter: { _id: verifiedData.sub },
        });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        if (user.changeCredentialsTime &&
            decode.iat * 1000 + 1000 <
                user.changeCredentialsTime?.getTime()) {
            throw new BadRequestError("revoked token please login first");
        }
        return { user, decode };
    }
}
export const tokenService = new TokenService();
