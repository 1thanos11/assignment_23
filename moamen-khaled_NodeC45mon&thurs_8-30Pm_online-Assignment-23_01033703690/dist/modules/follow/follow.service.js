import { startSession, Types, } from "mongoose";
import { FollowStatusEnum } from "../../common/enums/follow.enums.js";
import { JobEnum } from "../../common/enums/job.enums.js";
import { NotificationTargetTypeEnum, NotificationTypeEnum, PushStatusEnum, } from "../../common/enums/notification.enums.js";
import { ProfileVisibilityEnum } from "../../common/enums/profile.enums.js";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, } from "../../common/errors/client.errors.js";
import { InternalServerError } from "../../common/errors/server.errors.js";
import { redisService } from "../../common/services/redis.service.js";
import { notificationQueue } from "../../infra/queue/queues/notification.queue.js";
import { BlockRepository, FollowRepository, NotificationRepository, ProfileRepository, SettingsRepository, StatsRepository, UserRepository, } from "../../infra/repository/index.js";
import { realtimeGateWay } from "../realtime/realtime.gateway.js";
import { CacheTTL } from "../../common/constants/cache.constants.js";
import { ShowFollowEnum } from "../../common/enums/settings.enums.js";
import { PaginateDefault } from "../../common/constants/paginate.constants.js";
class FollowService {
    userRepository;
    profileRepository;
    statsRepository;
    followRepository;
    blockRepository;
    settingsRepository;
    redis = redisService;
    notification;
    get realtime() {
        return realtimeGateWay;
    }
    constructor() {
        this.userRepository = new UserRepository();
        this.profileRepository = new ProfileRepository();
        this.statsRepository = new StatsRepository();
        this.followRepository = new FollowRepository();
        this.blockRepository = new BlockRepository();
        this.settingsRepository = new SettingsRepository();
        this.notification = new NotificationRepository();
    }
    async follow(inputs) {
        const { user, targetUserId } = inputs;
        if (user._id.equals(targetUserId)) {
            throw new BadRequestError(`You can't follow your self`);
        }
        const [targetUser, isBlock, targetProfile, userProfile, settings] = await Promise.all([
            this.userRepository.findOne({
                filter: { _id: targetUserId },
            }),
            this.blockRepository.findOne({
                filter: {
                    $or: [
                        { blockerId: user._id, blockedId: targetUserId },
                        { blockerId: targetUserId, blockedId: user._id },
                    ],
                },
            }),
            this.profileRepository.findOne({
                filter: { ownerId: targetUserId },
            }),
            this.profileRepository.findOne({
                filter: { ownerId: user._id },
            }),
            this.settingsRepository.findOne({
                filter: { ownerId: targetUserId },
            }),
        ]);
        if (!targetUser) {
            throw new NotFoundError(`User not found`);
        }
        if (isBlock) {
            throw new ForbiddenError(`User not found`);
        }
        if (!targetProfile) {
            throw new NotFoundError(`Target profile not found`);
        }
        if (!userProfile) {
            throw new NotFoundError(`Your profile not found`);
        }
        if (!settings) {
            throw new NotFoundError(`Settings not found`);
        }
        const isPrivate = targetProfile.visibility === ProfileVisibilityEnum.PRIVATE;
        const session = await startSession();
        session.startTransaction();
        let follow = undefined;
        try {
            follow = await this.followRepository.createOne({
                data: {
                    followerId: user._id,
                    followingId: targetUserId,
                    followStatus: isPrivate
                        ? FollowStatusEnum.REQUESTED
                        : FollowStatusEnum.ACCEPTED,
                },
                options: { session },
            });
            if (!isPrivate) {
                await this.statsRepository.findOneAndUpdate({
                    filter: { ownerId: targetUserId },
                    update: { $inc: { followersCount: 1 } },
                    options: { session },
                });
                await this.statsRepository.findOneAndUpdate({
                    filter: { ownerId: user._id },
                    update: { $inc: { followingCount: 1 } },
                    options: { session },
                });
            }
            await session.commitTransaction();
        }
        catch (error) {
            await session.abortTransaction();
            if (error?.code === 11000) {
                throw new ConflictError("You already follow or requested to follow this user");
            }
            throw error;
        }
        finally {
            await session.endSession();
        }
        if (!follow) {
            throw new InternalServerError(`Fail to follow this user please try again later`);
        }
        const socketIds = await this.redis.getSockets(user._id);
        isPrivate
            ? this.realtime.getIo
                .to(socketIds)
                .emit("request_follow_user", { actorId: user._id, targetUserId })
            : this.realtime.getIo
                .to(socketIds)
                .emit("follow_user", { actorId: user._id, targetUserId });
        await Promise.all([
            this.redis.incrementFollowingVersion(user._id),
            this.redis.incrementFollowersVersion(targetUserId),
        ]);
        if (settings.allowNotifications) {
            try {
                const notificationDB = await this.notification.createOne({
                    data: {
                        actorId: user._id,
                        recipientId: targetUserId,
                        notificationType: NotificationTypeEnum.FOLLOW,
                        notificationTargetType: NotificationTargetTypeEnum.USER,
                        notificationTargetId: targetUserId,
                        title: `New Follow`,
                        body: isPrivate
                            ? `${userProfile.username} send you follow request`
                            : `${userProfile.username} follow you`,
                        data: {
                            username: `${userProfile.username}`,
                            avatarUrl: `${userProfile.avatarUrl}`,
                        },
                        pushStatus: PushStatusEnum.PENDING,
                    },
                });
                if (notificationDB) {
                    const data = {
                        userIds: [targetUser._id],
                        title: `New follow`,
                        body: JSON.stringify({
                            message: isPrivate
                                ? `${userProfile.username} send you follow request`
                                : `${userProfile.username} follow you`,
                            followerId: user._id,
                            followingId: targetUserId,
                        }),
                        notificationId: notificationDB._id,
                    };
                    void notificationQueue.add(JobEnum.SEND_MULTIPLE_NOTIFICATIONS, { ...data }, { attempts: 3, backoff: { type: "exponential", delay: 3000 } });
                }
            }
            catch (error) {
            }
        }
        return { status: follow?.followStatus };
    }
    async unFollow(inputs) {
        const { user, targetUserId } = inputs;
        if (user._id.equals(targetUserId)) {
            throw new BadRequestError(`You can't unFollow yourself`);
        }
        const [targetUser, isFollower] = await Promise.all([
            this.userRepository.findOne({
                filter: { _id: targetUserId },
            }),
            this.followRepository.findOne({
                filter: { followerId: user._id, followingId: targetUserId },
            }),
        ]);
        if (!targetUser) {
            throw new NotFoundError(`User not found`);
        }
        if (!isFollower) {
            throw new ConflictError(`You already not following him`);
        }
        const session = await startSession();
        session.startTransaction();
        try {
            await this.followRepository.findOneAndDelete({
                filter: { followerId: user._id, followingId: targetUserId },
                options: { session },
            });
            await this.statsRepository.findOneAndUpdate({
                filter: { ownerId: user._id },
                update: { $inc: { followingCount: -1 } },
                options: { session },
            });
            await this.statsRepository.findOneAndUpdate({
                filter: { ownerId: targetUserId },
                update: { $inc: { followersCount: -1 } },
                options: { session },
            });
            await session.commitTransaction();
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            await session.endSession();
        }
        this.realtime.getIo
            .to(await this.redis.getSockets(user._id))
            .emit("unFollow_user", { actorId: user._id, targetUserId });
        await Promise.all([
            this.redis.incrementFollowingVersion(user._id),
            this.redis.incrementFollowersVersion(targetUserId),
        ]);
        return;
    }
    async rejectFollowRequest(inputs) {
        const { user, targetUserId } = inputs;
        const [targetUser, profile, settings] = await Promise.all([
            this.userRepository.findOne({ filter: { _id: targetUserId } }),
            this.profileRepository.findOne({ filter: { ownerId: user._id } }),
            this.settingsRepository.findOne({ filter: { ownerId: targetUserId } }),
        ]);
        if (!profile || !targetUser) {
            throw new NotFoundError(`Profile not found or user not found`);
        }
        if (!settings) {
            throw new NotFoundError(`settings not found`);
        }
        const follow = await this.followRepository.findOneAndDelete({
            filter: {
                followingId: user._id,
                followerId: targetUserId,
                requested: true,
            },
        });
        if (!follow) {
            throw new NotFoundError(`Follow request not found`);
        }
        this.realtime.getIo
            .to(await this.redis.getSockets(user._id))
            .emit("reject_follow_request", {
            rejecter: user._id,
            targetUserId,
            followRequestId: follow._id,
        });
        if (settings.allowNotifications === true) {
            try {
                const notificationDB = await this.notification.createOne({
                    data: {
                        actorId: user._id,
                        recipientId: targetUserId,
                        notificationType: NotificationTypeEnum.FOLLOW,
                        notificationTargetType: NotificationTargetTypeEnum.USER,
                        notificationTargetId: targetUserId,
                        title: `New notification`,
                        body: `${profile.username} reject your follow request`,
                        data: {
                            username: `${profile.username}`,
                            avatarUrl: `${profile.avatarUrl}`,
                        },
                        pushStatus: PushStatusEnum.PENDING,
                    },
                });
                if (notificationDB) {
                    const data = {
                        userIds: [targetUserId],
                        title: `New notification`,
                        body: JSON.stringify({
                            message: `${profile.username} reject you follow request`,
                            followerId: targetUserId,
                            followingId: user._id,
                        }),
                        notificationId: notificationDB._id,
                    };
                    void notificationQueue.add(JobEnum.SEND_MULTIPLE_NOTIFICATIONS, { ...data }, { attempts: 3, backoff: { type: "exponential", delay: 3000 } });
                }
            }
            catch (error) {
            }
        }
        await this.redis.incrementFollowRequestsVersion(user._id);
        return;
    }
    async acceptFollowRequest(inputs) {
        const { user, targetUserId } = inputs;
        const [targetUser, userProfile, targetSettings] = await Promise.all([
            this.userRepository.findOne({ filter: { _id: targetUserId } }),
            this.profileRepository.findOne({ filter: { ownerId: user._id } }),
            this.settingsRepository.findOne({ filter: { ownerId: targetUserId } }),
        ]);
        if (!userProfile || targetUser) {
            throw new NotFoundError(`profile not found or user not found`);
        }
        if (!targetSettings) {
            throw new NotFoundError(`Something went wrong may be target user not found`);
        }
        const session = await startSession();
        session.startTransaction();
        let follow = null;
        try {
            follow = await this.followRepository.findOneAndUpdate({
                filter: {
                    followingId: user._id,
                    followerId: targetUserId,
                    requested: true,
                },
                update: { $set: { followStatus: FollowStatusEnum.ACCEPTED } },
                options: { session },
            });
            if (!follow) {
                throw new NotFoundError(`Follow request not found`);
            }
            await this.statsRepository.findOneAndUpdate({
                filter: { ownerId: user._id },
                update: { $inc: { followersCount: 1 } },
                options: { session },
            });
            await this.statsRepository.findOneAndUpdate({
                filter: { ownerId: targetUserId },
                update: { $inc: { followingCount: 1 } },
                options: { session },
            });
            await session.commitTransaction();
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            await session.endSession();
        }
        this.realtime.getIo
            .to(await this.redis.getSockets(targetUserId))
            .emit("accept_follow_request", {
            followerId: targetUserId,
            followingId: user._id,
            followId: follow?._id,
        });
        await Promise.all([
            this.redis.incrementFollowingVersion(targetUserId),
            this.redis.incrementFollowersVersion(user._id),
        ]);
        if (targetSettings.allowNotifications === true) {
            try {
                const notificationDB = await this.notification.createOne({
                    data: {
                        actorId: user._id,
                        recipientId: targetUserId,
                        notificationType: NotificationTypeEnum.FOLLOW,
                        notificationTargetType: NotificationTargetTypeEnum.USER,
                        notificationTargetId: targetUserId,
                        title: `New notification`,
                        body: `${userProfile.username} accept your follow request`,
                        data: {
                            username: `${userProfile.username}`,
                            avatarUrl: `${userProfile.avatarUrl}`,
                        },
                        pushStatus: PushStatusEnum.PENDING,
                    },
                });
                if (notificationDB) {
                    const data = {
                        userIds: [targetUserId],
                        title: `New notification`,
                        body: JSON.stringify({
                            message: `${userProfile.username} accept you follow request`,
                            followerId: targetUserId,
                            followingId: user._id,
                        }),
                        notificationId: notificationDB._id,
                    };
                    void notificationQueue.add(JobEnum.SEND_MULTIPLE_NOTIFICATIONS, { ...data }, { attempts: 3, backoff: { type: "exponential", delay: 3000 } });
                }
                return;
            }
            catch (error) {
            }
            await this.redis.incrementFollowRequestsVersion(user._id);
            return;
        }
    }
    getFollowers = async ({ userId, page = PaginateDefault.PAGE, limit = PaginateDefault.LIMIT, search, }) => {
        const pipeline = [
            {
                $match: {
                    followingId: userId,
                    followStatus: FollowStatusEnum.ACCEPTED,
                },
            },
        ];
        if (search?.trim()) {
            pipeline.push({
                $lookup: {
                    from: "profiles",
                    localField: "followerId",
                    foreignField: "ownerId",
                    as: "follower",
                },
            }, { $unwind: "$follower" }, {
                $match: {
                    "follower.username": {
                        $regex: search,
                        $options: "i",
                    },
                },
            }, { $sort: { createdAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit });
        }
        else {
            pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit }, { $sort: { createdAt: -1 } }, {
                $lookup: {
                    from: "profiles",
                    localField: "followerId",
                    foreignField: "ownerId",
                    as: "follower",
                },
            }, { $unwind: "$follower" });
        }
        const version = await this.redis.getFollowersVersion(userId);
        const key = this.redis.followersKey({
            userId: userId,
            page,
            limit,
            search,
            version,
        });
        const followers = await this.redis.cache({
            key,
            ttl: CacheTTL.FOLLOWERS_LIST,
            fn: () => this.followRepository.aggregate({
                pipeline,
            }),
        });
        if (!followers?.length) {
            return [];
        }
        return followers;
    };
    async followersList(inputs) {
        const { user, targetUserId, page, limit, search } = inputs;
        const isOwner = user._id.equals(targetUserId);
        if (isOwner) {
            const followers = await this.getFollowers({
                userId: targetUserId,
                page: page,
                limit: limit,
                search: search,
            });
            return followers;
        }
        const [targetUser, targetProfile, isBlock, targetSettings, isFollower] = await Promise.all([
            this.userRepository.findOne({ filter: { _id: targetUserId } }),
            this.profileRepository.findOne({
                filter: { ownerId: targetUserId },
            }),
            this.blockRepository.findOne({
                filter: {
                    $or: [
                        { blockerId: user._id, blockedId: targetUserId },
                        { blockerId: targetUserId, blockedId: user._id },
                    ],
                },
            }),
            this.settingsRepository.findOne({ filter: { ownerId: targetUserId } }),
            this.followRepository.findOne({
                filter: { followerId: user._id, followingId: targetUserId },
            }),
        ]);
        if (!targetUser || isBlock) {
            throw new NotFoundError(`User not found`);
        }
        if (!targetProfile || !targetSettings) {
            throw new NotFoundError(`Something went wrong profile or settings not found please try again later`);
        }
        if (isFollower) {
            if (targetSettings.privacy.showFollowersList !== ShowFollowEnum.ONLY_ME) {
                const followers = await this.getFollowers({
                    userId: targetUserId,
                    page: page,
                    limit: limit,
                    search: search,
                });
                return followers;
            }
            throw new ForbiddenError(`You can't see the followers list of this user`);
        }
        if (targetProfile.visibility === ProfileVisibilityEnum.PRIVATE ||
            targetSettings.privacy.showFollowersList !== ShowFollowEnum.ANYONE) {
            throw new ForbiddenError(`You can't see the followers list of this user`);
        }
        const followers = await this.getFollowers({
            userId: targetUserId,
            page: page,
            limit: limit,
            search: search,
        });
        return followers;
    }
    getFollowingList = async ({ userId, page = PaginateDefault.PAGE, limit = PaginateDefault.LIMIT, search, }) => {
        const pipeline = [
            {
                $match: {
                    followerId: userId,
                    followStatus: FollowStatusEnum.ACCEPTED,
                },
            },
        ];
        if (search?.trim()) {
            pipeline.push({
                $lookup: {
                    from: "profiles",
                    localField: "followingId",
                    foreignField: "ownerId",
                    as: "following",
                },
            }, { $unwind: "$following" }, {
                $match: { "following.username": { $regex: search, $options: "i" } },
            }, { $sort: { createdAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit });
        }
        else {
            pipeline.push({ $sort: { createdAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit }, {
                $lookup: {
                    from: "profiles",
                    localField: "followingId",
                    foreignField: "ownerId",
                    as: "following",
                },
            }, { $unwind: "$following" });
        }
        const version = await this.redis.getFollowingsVersion(userId);
        const key = this.redis.followingsKey({
            userId,
            page,
            limit,
            search,
            version,
        });
        const followingList = await this.redis.cache({
            key,
            ttl: CacheTTL.FOLLOWINGS_LIST,
            fn: () => this.followRepository.aggregate({
                pipeline,
            }),
        });
        if (!followingList?.length) {
            return [];
        }
        return followingList;
    };
    async followingList(inputs) {
        const { user, targetUserId, page, limit, search } = inputs;
        const isOwner = user._id.equals(targetUserId);
        if (isOwner) {
            const followingList = await this.getFollowingList({
                userId: targetUserId,
                page: page,
                limit: limit,
                search: search,
            });
            return followingList;
        }
        const [targetUser, targetSettings, targetProfile, isFollower, isBlock] = await Promise.all([
            this.userRepository.findOne({ filter: { _id: targetUserId } }),
            this.settingsRepository.findOne({ filter: { ownerId: targetUserId } }),
            this.profileRepository.findOne({ filter: { ownerId: targetUserId } }),
            this.followRepository.findOne({
                filter: { followerId: user._id, followingId: targetUserId },
            }),
            this.blockRepository.findOne({
                filter: {
                    $or: [
                        { blockerId: user._id, blockedId: targetUserId },
                        { blockerId: targetUserId, blockedId: user._id },
                    ],
                },
            }),
        ]);
        if (isBlock) {
            throw new NotFoundError(`User not found`);
        }
        if (!targetUser || !targetSettings || !targetProfile) {
            throw new NotFoundError(`Something went wrong may be user not found`);
        }
        if (isFollower) {
            if (targetSettings.privacy.showFollowingsList !== ShowFollowEnum.ONLY_ME) {
                const followingList = await this.getFollowingList({
                    userId: targetUserId,
                    page: page,
                    limit: limit,
                    search: search,
                });
                return followingList;
            }
            throw new ForbiddenError(`You can't see the following list of this user`);
        }
        const isPrivate = targetProfile.visibility === ProfileVisibilityEnum.PRIVATE;
        if (isPrivate) {
            throw new ForbiddenError(`You can't see the following list of this user`);
        }
        if (targetSettings.privacy.showFollowingsList !== ShowFollowEnum.ANYONE) {
            throw new ForbiddenError(`You can't see the following list of this user`);
        }
        const followingList = await this.getFollowingList({
            userId: targetUserId,
            page: page,
            limit: limit,
            search: search,
        });
        return followingList;
    }
    getFollowRequestsList = async ({ userId, page = PaginateDefault.PAGE, limit = PaginateDefault.LIMIT, search, }) => {
        const pipeline = [
            {
                $match: {
                    followingId: userId,
                    followStatus: FollowStatusEnum.REQUESTED,
                },
            },
        ];
        if (search?.trim()) {
            pipeline.push({
                $lookup: {
                    from: "profiles",
                    localField: "followerId",
                    foreignField: "ownerId",
                    as: "requester",
                },
            }, { $unwind: "$requester" }, { $match: { "requester.username": { $regex: search, $options: "i" } } }, { $sort: { createdAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit });
        }
        else {
            pipeline.push({ $sort: { createdAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit }, {
                $lookup: {
                    from: "profiles",
                    localField: "followerId",
                    foreignField: "ownerId",
                    as: "requester",
                },
            }, { $unwind: "$requester" });
        }
        const version = await this.redis.getFollowRequestsVersion(userId);
        const key = this.redis.followRequestsKey({
            userId,
            page,
            limit,
            search: search,
            version,
        });
        const followRequestsList = await this.redis.cache({
            key,
            ttl: CacheTTL.FOLLOW_REQUESTS_LIST,
            fn: () => this.followRepository.aggregate({
                pipeline,
            }),
        });
        if (!followRequestsList?.length) {
            return [];
        }
        return followRequestsList;
    };
    async followRequestsList(inputs) {
        const { user, page, limit, search } = inputs;
        const requestsList = await this.getFollowRequestsList({
            userId: user._id,
            page: page,
            limit: limit,
            search: search,
        });
        return requestsList;
    }
}
export const followService = new FollowService();
