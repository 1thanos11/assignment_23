import express from "express";
import cors from "cors";
import helmet from "helmet";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { connectDB } from "../infra/database/connect.database.js";
import { PORT } from "../config/config.js";
import { redisService } from "../common/services/redis.service.js";
import { globalLimiter } from "../middlewares/rateLimit/global.rateLimit.middleware.js";
import { GlobalErrorMiddleware } from "../middlewares/error.middleware.js";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "../gql/index.js";
import { s3Service } from "../common/services/s3.service.js";
import { successResponse } from "../common/responses/success.response.js";
import { postRouter } from "../modules/post/index.js";
import { commentRouter } from "../modules/comment/index.js";
import { realtimeGateWay } from "../modules/realtime/realtime.gateway.js";
import { chatRouter } from "../modules/chat/index.js";
import { convertUnderReviewModerationCasesToPending } from "../jobs/moderationCase.job.js";
const s3WritableStream = promisify(pipeline);
async function bootstrap() {
    await connectDB();
    await redisService.connect();
    const app = express();
    app.use(cors(), helmet(), globalLimiter, express.json({ limit: "10mb" }));
    await convertUnderReviewModerationCasesToPending();
    app.use("/api/v1/post", postRouter);
    app.use("/api/v1/comment", commentRouter);
    app.use("/api/v1/chat", chatRouter);
    app.all("/graphql", createHandler({ schema: schema, context: (req) => ({ req }) }));
    app.get("/upload/*path", async (req, res, next) => {
        const { path } = req.params;
        const { download, fileName } = req.query;
        const Key = path.join("/");
        const { Body, ContentType } = await s3Service.getAsset({ Key });
        res.setHeader("ContentType", ContentType || "application/octet-stream");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        if (download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${fileName || Key.split("/").pop()}"`);
        }
        return s3WritableStream(Body, res);
    });
    app.get("uploads/*path", async (req, res, next) => {
        const { download, fileName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const url = await s3Service.createPreSignedUrlFetchLink({
            Key,
            download,
            fileName,
        });
        return successResponse({ res, data: { url } });
    });
    app.all("/*dummy", (req, res, next) => {
        return res.status(404).json({ message: "Invalid application routing" });
    });
    app.use(GlobalErrorMiddleware);
    const httpServer = app.listen(PORT, () => {
        console.log(`Server Is Running On PORT ${PORT}`);
    });
    realtimeGateWay.initializeIO(httpServer);
}
export default bootstrap;
