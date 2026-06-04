import { redisService } from "../../../common/services/redis.service.js";
import { realtimeGateWay } from "../../../modules/realtime/realtime.gateway.js";
class SocialProcess {
    redis = redisService;
    get realtime() {
        return realtimeGateWay;
    }
    async block({ blockerId, blockedId, }) {
        await Promise.all([
            this.redis.incrementBlockListVersion(blockerId),
            this.redis.incrementFollowersVersion(blockerId),
            this.redis.incrementFollowingVersion(blockerId),
            this.redis.incrementFollowersVersion(blockedId),
            this.redis.incrementFollowingVersion(blockedId),
        ]);
        const [userSocketIds, targetSocketIds] = await Promise.all([
            this.redis.getSockets(blockerId),
            this.redis.getSockets(blockedId),
        ]);
        this.realtime.getIo
            .to(userSocketIds)
            .emit("block_user", { blockerId: blockerId, blockedId: blockedId });
        this.realtime.getIo.to(targetSocketIds).emit("blocked_by_user", {
            blockerId: blockerId,
            blockedId: blockedId,
        });
    }
}
export const socialProcess = new SocialProcess();
