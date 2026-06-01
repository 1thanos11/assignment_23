import { BadRequestError, ForbiddenError, UnauthorizedError, } from "../common/errors/index.js";
import { TokenTypeEnum } from "../common/enums/security.enums.js";
import { tokenService } from "../common/services/token.service.js";
export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        if (!req?.headers?.authorization) {
            throw new BadRequestError("No headers passed");
        }
        const [flag, token] = req.headers.authorization.split(" ");
        if (!token) {
            throw new BadRequestError("No token passed");
        }
        const { user, decode } = await tokenService.authenticateToken({
            token,
            tokenType,
        });
        req.user = user;
        req.decode = decode;
        next();
    };
};
export const restFullApiAuthorization = (roles) => {
    return async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ForbiddenError("you are not authorized");
        }
        next();
    };
};
export const GQLAuthentication = async ({ context, tokenType = TokenTypeEnum.ACCESS, }) => {
    const authorization = context.req.raw.headers.authorization;
    if (!authorization) {
        throw new UnauthorizedError("No authorization header");
    }
    console.log(authorization);
    const [flag, token] = authorization.split(" ");
    console.log({ flag, token });
    if (!token?.trim().length) {
        throw new UnauthorizedError("No token passed");
    }
    const { user, decode } = await tokenService.authenticateToken({
        token,
        tokenType,
    });
    return { user, decode };
};
