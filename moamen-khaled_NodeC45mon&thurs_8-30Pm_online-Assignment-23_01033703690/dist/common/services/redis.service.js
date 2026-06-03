import { createClient } from "redis";
import { REDIS_URI } from "../../config/config.js";
import { EmailEnum } from "../enums/security.enums.js";
import { PaginateDefault } from "../constants/paginate.constants.js";
import { PostContextEnum } from "../enums/redis.enums.js";
class RedisService {
    client;
    constructor() {
        this.client = createClient({ url: REDIS_URI });
        this.eventHandler();
    }
    async connect() {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    }
    eventHandler() {
        this.client.on("connect", () => console.log("Redis_DB Connected Successfully"));
        this.client.on("error", () => console.log("Redis_DB Connection Failed"));
    }
    baseRevokeTokenKey(userId) {
        return `Auth::Revoke::${userId}`;
    }
    revokeTokenKey({ userId, jti, }) {
        return `${this.baseRevokeTokenKey(userId)}::${jti}`;
    }
    userRateLimitKey({ userId, path, }) {
        return `Auth::RateLimit::${userId}::${path}`;
    }
    ipRateLimitKey({ ip, path }) {
        return `Auth::RateLimit::${ip}::${path}`;
    }
    emailRateLimitKey({ email, path }) {
        return `Auth::RateLimit::${email}::${path}`;
    }
    otpKey({ email, subject = EmailEnum.CONFIRM_EMAIL }) {
        return `Auth::OTP::${email}::${subject}`;
    }
    otpMaxAttemptsKey({ email, subject = EmailEnum.CONFIRM_EMAIL, }) {
        return `${this.otpKey({ email, subject })}::MaxTrial`;
    }
    OtpBlockKey({ email, subject = EmailEnum.CONFIRM_EMAIL, }) {
        return `${this.otpKey({ email, subject })}::Block`;
    }
    FCMKey(userId) {
        return `FCM::User::${userId}`;
    }
    socketKey(userId) {
        return `Socket::User::${userId}`;
    }
    userVersionKey(id) {
        return `User::${id}::Version`;
    }
    userBaseKey({ id, version }) {
        return `User::${id}::v${version}`;
    }
    userKey({ id, version }) {
        return `${this.userBaseKey({ id, version })}::Root`;
    }
    userProfileKey({ id, version }) {
        return `${this.userBaseKey({ id, version })}::Profile`;
    }
    userSettingsKey({ id, version }) {
        return `${this.userBaseKey({ id, version })}::Settings`;
    }
    userStatsKey({ id, version }) {
        return `${this.userBaseKey({ id, version })}::Stats`;
    }
    wholeProfileKey({ id, version }) {
        return `${this.userBaseKey({ id, version })}::Whole_Profile`;
    }
    postVersionKey({ userId, postId = "List", }) {
        return `Post::User::${userId}::${postId}`;
    }
    postKey({ userId, postId, context = PostContextEnum.OWNER, version, }) {
        return `Post::User::${userId}::${postId}::${context}::v1${version}`;
    }
    postsListKey({ targetUserId, page = PaginateDefault.PAGE, limit = PaginateDefault.LIMIT, search = PaginateDefault.SEARCH, context = PostContextEnum.OWNER, version, }) {
        return `Post::List::${targetUserId}::${page}::${limit}::${search}::${context}::v${version}`;
    }
    commentVersionKey(commentId) {
        return `Comment::User::::${commentId}`;
    }
    commentKey({ commentId, version, }) {
        return `Comment::${commentId}::v${version}`;
    }
    commentsListKey({ postId, page = PaginateDefault.PAGE, limit = PaginateDefault.LIMIT, version, }) {
        return `Comment::List::${postId}::${page}::${limit}::v${version}`;
    }
    messageVersionKey(chatId) {
        return `Chat::Messages::${chatId}::Version`;
    }
    messageKey({ chatId, cursor, limit, version, }) {
        return `Chat::Messages::${chatId}::${cursor ?? "latest"}::${limit}::v${version}`;
    }
    followersVersionKey(userId) {
        return `Followers::User::${userId}::version`;
    }
    followersKey({ userId, page = PaginateDefault.PAGE, limit = PaginateDefault.LIMIT, search = PaginateDefault.SEARCH, version, }) {
        return `Followers::User::${userId}::${page}::${limit}::${search}::v${version}`;
    }
    followingsVersionKey(userId) {
        return `Followings::User::${userId}::version`;
    }
    followingsKey({ userId, page = PaginateDefault.PAGE, limit = PaginateDefault.LIMIT, search = PaginateDefault.SEARCH, version, }) {
        return `Followings::User::${userId}::${page}::${limit}::${search}::v${version}`;
    }
    followRequestsVersionKey(userId) {
        return `Follow_Requests::User::${userId}::version`;
    }
    followRequestsKey({ userId, page = PaginateDefault.PAGE, limit = PaginateDefault.LIMIT, search = PaginateDefault.SEARCH, version, }) {
        return `Follow_Requests::User::${userId}::v${version}::${page}::${limit}::${search}`;
    }
    async set({ key, value, options, }) {
        try {
            return await this.client.set(key, JSON.stringify(value), options);
        }
        catch {
            console.log("Fail in redis set operation");
            return null;
        }
    }
    async get(key) {
        try {
            const value = await this.client.get(key);
            if (!value)
                return null;
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        catch {
            console.log("Fail in redis get operation");
            return null;
        }
    }
    async mGet(keys) {
        try {
            const values = await this.client.mGet(keys);
            return values.map((value) => {
                if (value === null)
                    return null;
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            });
        }
        catch {
            console.log("Fail in redis mGet operation");
            return [];
        }
    }
    async del(keys) {
        try {
            if (!keys?.length)
                return 0;
            return await this.client.del(keys);
        }
        catch {
            console.log("Fail in redis del operation");
            return 0;
        }
    }
    async incr(key) {
        try {
            return await this.client.incr(key);
        }
        catch {
            console.log("Fail in redis incr operation");
            return 0;
        }
    }
    async decr(key) {
        try {
            return await this.client.decr(key);
        }
        catch {
            console.log("Fail in redis decr operation");
            return 0;
        }
    }
    async incrBy({ key, increment, }) {
        try {
            return await this.client.incrBy(key, increment);
        }
        catch {
            console.log("Fail in redis incrBy operation");
            return 0;
        }
    }
    async decrBy({ key, decrement, }) {
        try {
            return await this.client.decrBy(key, decrement);
        }
        catch {
            console.log("Fail in redis decrBy operation");
            return 0;
        }
    }
    async ttl(key) {
        try {
            return await this.client.ttl(key);
        }
        catch {
            console.log("Fail in redis ttl operation");
            return -2;
        }
    }
    async expire({ key, seconds, mode, }) {
        try {
            return await this.client.expire(key, seconds, mode);
        }
        catch {
            console.log("Fail in redis expire operation");
            return 0;
        }
    }
    async exists(keys) {
        try {
            return await this.client.exists(keys);
        }
        catch {
            console.log("Fail in redis exists operation");
            return 0;
        }
    }
    async scan({ pattern, count = 100, }) {
        try {
            let cursor = "0";
            const results = [];
            do {
                const reply = await this.client.scan(cursor, {
                    MATCH: pattern,
                    COUNT: count,
                });
                cursor = reply.cursor;
                results.push(...reply.keys);
            } while (cursor !== "0");
            return results;
        }
        catch {
            console.log("Fail in redis scan operation");
            return [];
        }
    }
    async sAdd({ key, members, }) {
        try {
            return await this.client.sAdd(key, members);
        }
        catch {
            console.log("Fail in redis sAdd operation");
            return 0;
        }
    }
    async sRem({ key, members, }) {
        try {
            return await this.client.sRem(key, members);
        }
        catch {
            console.log("Fail in redis sRem operation");
            return 0;
        }
    }
    async sMembers(key) {
        try {
            return await this.client.sMembers(key);
        }
        catch (error) {
            console.log("Fail in redis sMembers operation", error);
            return [];
        }
    }
    async sCard(key) {
        try {
            return await this.client.sCard(key);
        }
        catch {
            console.log("Fail in redis sCard operation");
            return 0;
        }
    }
    async pipeline({ items, command, }) {
        const pipeline = this.client.multi();
        for (const item of items) {
            command(item, pipeline);
        }
        return (await pipeline.exec());
    }
    async cache({ key, ttl, fn, }) {
        const cached = await this.get(key);
        if (cached) {
            console.log("redis");
            return cached;
        }
        const result = await fn();
        if (result === undefined || result === null)
            return null;
        await this.set({
            key,
            value: result,
            options: { expiration: { type: "EX", value: ttl } },
        });
        return result;
    }
    async getOrFetch({ key, fn, }) {
        const cached = await this.get(key);
        if (cached)
            return cached;
        const result = await fn();
        if (result === undefined || result === null)
            return null;
        return result;
    }
    async getUserVersion(id) {
        const key = this.userVersionKey(id);
        const previous = await this.client.set(key, "1", {
            condition: "NX",
            GET: true,
        });
        return previous ? Number(previous) : 1;
    }
    async incrementUserVersion(id) {
        const key = this.userVersionKey(id);
        return await this.incr(key);
    }
    async getPostVersion({ userId, postId = "List", }) {
        const key = this.postVersionKey({ userId, postId });
        const previous = await this.client.set(key, "1", {
            condition: "NX",
            GET: true,
        });
        return previous ? Number(previous) : 1;
    }
    async incrementPostVersion({ userId, postId = "List", }) {
        const key = this.postVersionKey({ userId, postId });
        return await this.incr(key);
    }
    async getCommentVersion(commentId) {
        const key = this.commentVersionKey(commentId);
        const previous = await this.client.set(key, "1", {
            condition: "NX",
            GET: true,
        });
        return previous ? Number(previous) : 1;
    }
    async incrementCommentVersion(commentId) {
        const key = this.commentVersionKey(commentId);
        return await this.incr(key);
    }
    async getMessageVersion(chatId) {
        const key = this.messageVersionKey(chatId);
        const previous = await this.client.set(key, "1", {
            condition: "NX",
            GET: true,
        });
        return previous ? Number(previous) : 1;
    }
    async incrementMessagesVersion(chatId) {
        const key = this.messageVersionKey(chatId);
        return await this.incr(key);
    }
    async getFollowersVersion(userId) {
        const key = this.followersVersionKey(userId);
        const previous = this.client.set(key, "1", { condition: "NX", GET: true });
        return previous ? Number(previous) : 1;
    }
    async incrementFollowersVersion(userId) {
        const key = this.followersVersionKey(userId);
        return await this.incr(key);
    }
    async getFollowingsVersion(userId) {
        const key = this.followingsVersionKey(userId);
        const previous = this.client.set(key, "1", { condition: "NX", GET: true });
        return previous ? Number(previous) : 1;
    }
    async incrementFollowingVersion(userId) {
        const key = this.followingsVersionKey(userId);
        return await this.incr(key);
    }
    async getFollowRequestsVersion(userId) {
        const key = this.followRequestsVersionKey(userId);
        const previous = await this.client.set(key, "1", {
            condition: "NX",
            GET: true,
        });
        return previous ? Number(previous) : 1;
    }
    async incrementFollowRequestsVersion(userId) {
        const key = this.followRequestsVersionKey(userId);
        return await this.incr(key);
    }
    async getSockets(userId) {
        return await this.sMembers(this.socketKey(userId));
    }
}
export const redisService = new RedisService();
