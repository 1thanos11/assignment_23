import { BlockRepository, FollowRepository, ProfileRepository, SettingsRepository, StatsRepository, UserRepository, } from "../../infra/repository/index.js";
import { NotFoundError } from "../../common/errors/client.errors.js";
import { redisService } from "../../common/services/redis.service.js";
import { UserVersionContextEnum } from "../../common/enums/redis.enums.js";
import { CacheTTL } from "../../common/constants/cache.constants.js";
import { ProfileVisibilityEnum } from "../../common/enums/profile.enums.js";
import { InternalServerError } from "../../common/errors/server.errors.js";
class ProfileService {
    profileRepository;
    settingsRepository;
    userRepository;
    statsRepository;
    followRepository;
    blockRepository;
    redis = redisService;
    constructor() {
        this.profileRepository = new ProfileRepository();
        this.settingsRepository = new SettingsRepository();
        this.statsRepository = new StatsRepository();
        this.followRepository = new FollowRepository();
        this.blockRepository = new BlockRepository();
        this.userRepository = new UserRepository();
    }
    async profile(inputs) {
        const { user } = inputs;
        const profileVersion = await this.redis.getProfileVersion(user._id);
        const profileKey = this.redis.profileKey({
            id: user._id,
            version: profileVersion,
        });
        const statsVersion = await this.redis.getStatsVersion(user._id);
        const statsKey = this.redis.userStatsKey({
            id: user._id,
            version: statsVersion,
        });
        const [profile, stats] = await Promise.all([
            this.redis.cache({
                key: profileKey,
                ttl: CacheTTL.PROFILE,
                fn: () => this.profileRepository.findOne({
                    filter: { ownerId: user._id },
                    options: {
                        populate: [
                            {
                                path: "ownerId",
                                select: "email phone _id",
                                populate: [{ path: "posts" }],
                            },
                        ],
                    },
                }),
            }),
            this.redis.cache({
                key: statsKey,
                ttl: CacheTTL.STATS,
                fn: () => this.statsRepository.findOne({
                    filter: { ownerId: user._id },
                }),
            }),
        ]);
        if (!profile || !stats) {
            throw new InternalServerError(`Something went wrong please try again later`);
        }
        console.log({ profile, stats });
        return { profile, stats };
    }
    async getProfileById(inputs) {
        const { user, targetId } = inputs;
        if (user._id.equals(targetId)) {
            return await this.profile({ user });
        }
        const version = await this.redis.getSettingsVersion(targetId);
        const key = this.redis.settingsKey({ userId: targetId, version });
        const [isFollower, targetSettings, isBlock, targetUser, targetProfile, stats,] = await Promise.all([
            this.followRepository.findOne({
                filter: { followerId: user._id, followingId: targetId },
            }),
            this.redis.cache({
                key,
                ttl: CacheTTL.SETTINGS,
                fn: () => this.settingsRepository.findOne({ filter: { ownerId: targetId } }),
            }),
            this.blockRepository.findOne({
                filter: {
                    $or: [
                        { blockerId: user._id, blockedId: targetId },
                        { blockerId: targetId, blockedId: user._id },
                    ],
                },
            }),
            this.userRepository.findOne({ filter: { _id: targetId } }),
            this.profileRepository.findOne({
                filter: { ownerId: targetId },
                options: {
                    populate: [
                        {
                            path: "ownerId",
                            select: "_id email phone",
                            populate: [{ path: "posts" }],
                        },
                    ],
                },
            }),
            this.redis.cache({
                key,
                ttl: CacheTTL.STATS,
                fn: () => this.statsRepository.findOne({ filter: { ownerId: targetId } }),
            }),
        ]);
        if (!targetSettings || !targetUser || isBlock || !targetProfile || !stats) {
            throw new NotFoundError(`User not found`);
        }
        if (!isFollower) {
            if (targetProfile.visibility === ProfileVisibilityEnum.PRIVATE) {
                return {
                    profile: {
                        _id: targetProfile._id,
                        ownerId: targetProfile.ownerId,
                        username: targetProfile.username,
                        avatarUrl: targetProfile.avatarUrl,
                    },
                    stats,
                };
            }
        }
        const profile = targetProfile.toObject();
        if (targetSettings.privacy.showDOB === false)
            delete profile.DOB;
        if (targetSettings.privacy.showEducation === false)
            delete profile.education;
        if (targetSettings.privacy.showJoinedAt === false)
            delete profile.joinedAt;
        if (targetSettings.privacy.showLocation === false)
            delete profile.location;
        if (targetSettings.privacy.showRelation === false)
            delete profile.relationship;
        if (profile.ownerId) {
            if (targetSettings.privacy.showEmail === false)
                delete profile.ownerId.email;
            if (targetSettings.privacy.showPhone === false)
                delete profile.ownerId.phone;
            if (targetSettings.privacy.showLastSeen === false)
                delete profile.ownerId.lastSeenAt;
        }
        return { profile, stats };
    }
    async getStats(inputs) {
        const { targetId } = inputs;
        const targetUser = await this.userRepository.findOne({
            filter: { _id: targetId },
        });
        if (!targetUser) {
            throw new NotFoundError("User not found");
        }
        const version = await this.redis.getStatsVersion(targetId);
        const key = this.redis.userStatsKey({
            id: targetId,
            version,
        });
        const stats = await this.redis.cache({
            key,
            ttl: CacheTTL.STATS,
            fn: () => this.statsRepository.findOne({
                filter: { ownerId: targetId },
            }),
        });
        if (!stats) {
            throw new NotFoundError("Stats not found");
        }
        return stats;
    }
}
export const profileService = new ProfileService();
