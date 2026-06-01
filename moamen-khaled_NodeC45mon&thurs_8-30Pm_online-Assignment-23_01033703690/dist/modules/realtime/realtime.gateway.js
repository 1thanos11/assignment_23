import { Server } from "socket.io";
import { BadRequestError } from "../../common/errors/client.errors.js";
import { redisService } from "../../common/services/redis.service.js";
import { tokenService } from "../../common/services/token.service.js";
import { ORIGINS } from "../../config/config.js";
import { chatGateWay } from "../chat/index.js";
class RealtimeGateWay {
    io;
    tokenService = tokenService;
    redis = redisService;
    chatGateWay = chatGateWay;
    get getIo() {
        return this.io;
    }
    authentication = async (socket, next) => {
        try {
            const authorization = socket.handshake.auth.authorization ||
                socket.handshake.headers.authorization;
            if (!authorization) {
                throw new BadRequestError(`No token passed`);
            }
            const [flag, token] = authorization.split(" ");
            if (!token) {
                throw new BadRequestError(`No token passed`);
            }
            const { user, decode } = await this.tokenService.authenticateToken({
                token: token,
            });
            socket.data = { user, decode };
            const key = this.redis.socketKey(user._id);
            await this.redis.sAdd({ key, members: [socket.id] });
            next();
        }
        catch (error) {
            next(error);
        }
    };
    async initializeIO(httpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: ORIGINS,
                methods: ["GET", "POST"],
                credentials: true,
            },
        });
        this.io.of("/").use(this.authentication);
        this.io.on("connection", (socket) => {
            this.chatGateWay.registerEvents(socket, this.io);
            socket.on("disconnect", async () => {
                const socketKey = this.redis.socketKey(socket.data.user._id);
                await this.redis.sRem({ key: socketKey, members: socket.id });
                socket.data.currentChat = null;
            });
        });
    }
}
export const realtimeGateWay = new RealtimeGateWay();
