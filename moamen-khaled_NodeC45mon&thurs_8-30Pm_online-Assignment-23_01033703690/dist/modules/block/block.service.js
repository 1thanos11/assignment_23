import { startSession, Types } from "mongoose";
import { ConflictError, ForbiddenError, NotFoundError, } from "../../common/errors/client.errors.js";
import { BlockRepository, FollowRepository, UserRepository, } from "../../infra/repository/index.js";
import { redisService } from "../../common/services/redis.service.js";
import { realtimeGateWay } from "../realtime/realtime.gateway.js";
import { CacheTTL } from "../../common/constants/cache.constants.js";
class BlockService {
    userRepository;
    blockRepository;
    followRepository;
    redis = redisService;
    get realtime() {
        return realtimeGateWay;
    }
    constructor() {
        this.userRepository = new UserRepository();
        this.blockRepository = new BlockRepository();
        this.followRepository = new FollowRepository();
    }
    async block(inputs) {
        const { user, targetUserId } = inputs;
        if (user._id.equals(targetUserId)) {
            throw new ForbiddenError(`You can't block yourself`);
        }
        const targetUser = await this.userRepository.findOne({
            filter: { _id: targetUserId },
        });
        if (!targetUser) {
            throw new NotFoundError(`User not found`);
        }
        const session = await startSession();
        try {
            await session.withTransaction(async () => {
                await this.blockRepository.createOne({
                    data: { blockerId: user._id, blockedId: targetUserId },
                    options: { session },
                });
                await this.followRepository.deleteMany({
                    filter: {
                        $or: [
                            {
                                followerId: user._id,
                                followingId: targetUserId,
                            },
                            {
                                followerId: targetUserId,
                                followingId: user._id,
                            },
                        ],
                    },
                    options: { session },
                });
            });
        }
        catch (error) {
            if (error.code === 11000) {
                throw new ConflictError(`You already blocked this user`);
            }
            throw error;
        }
        finally {
            await session.endSession();
        }
        const [userSocketIds, targetSocketIds] = await Promise.all([
            this.redis.getSockets(user._id),
            this.redis.getSockets(targetUserId),
        ]);
        this.realtime.getIo
            .to(userSocketIds)
            .emit("block_user", { blockerId: user._id, blockedId: targetUserId });
        this.realtime.getIo.to(targetSocketIds).emit("blocked_by_user", {
            blockerId: user._id,
            blockedId: targetUserId,
        });
        await Promise.all([
            this.redis.incrementBlockListVersion(user._id),
            this.redis.incrementFollowersVersion(user._id),
            this.redis.incrementFollowingVersion(user._id),
            this.redis.incrementFollowersVersion(targetUserId),
            this.redis.incrementFollowingVersion(targetUserId),
        ]);
        return;
    }
    async unBlock(inputs) {
        const { user, targetUserId } = inputs;
        if (user._id.equals(targetUserId)) {
            throw new ForbiddenError(`You can't un block yourself`);
        }
        const isBlock = await this.blockRepository.findOneAndDelete({
            filter: { blockerId: user._id, blockedId: targetUserId },
        });
        if (!isBlock) {
            throw new ConflictError(`You did not block this user`);
        }
        const [userSocketIds, targetSocketIds] = await Promise.all([
            this.redis.getSockets(user._id),
            this.redis.getSockets(targetUserId),
        ]);
        this.realtime.getIo
            .to(userSocketIds)
            .emit("block_user", { blockerId: user._id, blockedId: targetUserId });
        this.realtime.getIo.to(targetSocketIds).emit("blocked_by_user", {
            blockerId: user._id,
            blockedId: targetUserId,
        });
        await this.redis.incrementBlockListVersion(user._id);
        return;
    }
    async getBlockList({ userId, page, limit, search, }) {
        const pipeline = [{ $match: { blockerId: userId } }];
        if (search?.trim()) {
            pipeline.push({
                $lookup: {
                    from: "profiles",
                    localField: "blockedId",
                    foreignField: "ownerId",
                    as: "blocked",
                },
            }, { $unwind: "$blocked" }, { $match: { "blocked.username": { $regex: search, $options: "i" } } }, { $sort: { createdAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit });
        }
        else {
            pipeline.push({ $sort: { createdAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit }, {
                $lookup: {
                    from: "profiles",
                    localField: "blockedId",
                    foreignField: "ownerId",
                    as: "blocked",
                },
            }, { $unwind: "$blocked" });
        }
        const version = await this.redis.getBlockListVersion(userId);
        const key = this.redis.blockListKey({ userId, version });
        const blockList = await this.redis.cache({
            key,
            ttl: CacheTTL.BLOCK_LIST,
            fn: () => this.blockRepository.aggregate({ pipeline }),
        });
        if (!blockList?.length) {
            return [];
        }
        return blockList;
    }
    async blockList(inputs) {
        const { user, page, limit, search } = inputs;
        const blockList = await this.getBlockList({
            userId: user._id,
            page: page,
            limit: limit,
            search: search,
        });
        return blockList;
    }
}
export const blockService = new BlockService();
