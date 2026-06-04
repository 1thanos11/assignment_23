import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { blockService } from "../block.service.js";
import { blockValidation } from "../block.validation.js";
class BlockResolver {
    blockValidation = blockValidation;
    blockService = blockService;
    block = async (parent, { targetUserId }, context) => {
        const { user } = await GQLAuthentication({ context });
        const verifiedData = await GQLValidate({
            schema: this.blockValidation.block,
            args: { targetUserId },
        });
        await this.blockService.block({ user, ...verifiedData });
        return { message: "Success" };
    };
    unBlock = async (parent, { targetUserId }, context) => {
        const { user } = await GQLAuthentication({ context });
        const verifiedData = await GQLValidate({
            schema: this.blockValidation.block,
            args: { targetUserId },
        });
        await this.blockService.unBlock({ user, ...verifiedData });
        return { message: "Success" };
    };
    blockList = async (parent, { page, limit, search }, context) => {
        const { user } = await GQLAuthentication({ context });
        const verifiedData = await GQLValidate({
            schema: this.blockValidation.blockList,
            args: { page, limit, search },
        });
        const blockList = await this.blockService.blockList({
            user,
            ...verifiedData,
        });
        return { message: "Success", data: blockList };
    };
}
export const blockResolver = new BlockResolver();
