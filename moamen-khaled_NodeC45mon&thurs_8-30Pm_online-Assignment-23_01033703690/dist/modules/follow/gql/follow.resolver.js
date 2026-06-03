import { GQLAuthentication } from "../../../middlewares/auth.middleware.js";
import { GQLValidate } from "../../../middlewares/validation.middleware.js";
import { followService } from "../follow.service.js";
import { followValidation } from "../follow.validation.js";
class FollowResolver {
    followValidation = followValidation;
    followService = followService;
    follow = async (parent, { targetUserId }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GQLValidate({
            schema: this.followValidation.followUser,
            args: { targetUserId },
        });
        const { status } = await this.followService.follow({
            user,
            targetUserId,
        });
        return { message: "success", data: status };
    };
    unFollow = async (parent, { targetUserId }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GQLValidate({
            schema: followValidation.followUser,
            args: { targetUserId },
        });
        await this.followService.unFollow({
            user,
            targetUserId,
        });
        return { message: "UnFollowed" };
    };
    rejectFollowRequest = async (parent, { targetUserId }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GQLValidate({
            schema: followValidation.followUser,
            args: { targetUserId },
        });
        await this.followService.rejectFollowRequest({ user, targetUserId });
        return { message: "rejected successfully" };
    };
    acceptFollowRequest = async (parent, { targetUserId }, context) => {
        const { user } = await GQLAuthentication({ context });
        await GQLValidate({
            schema: followValidation.followUser,
            args: { targetUserId },
        });
        await this.followService.acceptFollowRequest({ user, targetUserId });
        return { message: "accepted successfully" };
    };
    followersList = async (parent, { targetUserId, page, limit, search }, context) => {
        const { user } = await GQLAuthentication({ context });
        const validatedData = await GQLValidate({
            schema: followValidation.followersList,
            args: { targetUserId, page, limit, search },
        });
        const followers = await this.followService.followersList({
            user,
            ...validatedData,
        });
        return { message: "Success", data: followers };
    };
    followingList = async (parent, { targetUserId, page, limit, search }, context) => {
        const { user } = await GQLAuthentication({ context });
        const validatedData = await GQLValidate({
            schema: this.followValidation.followersList,
            args: { targetUserId, page, limit, search },
        });
        const followingList = await this.followService.followingList({
            user,
            ...validatedData,
        });
        return { message: "Success", data: followingList };
    };
}
export const followResolver = new FollowResolver();
