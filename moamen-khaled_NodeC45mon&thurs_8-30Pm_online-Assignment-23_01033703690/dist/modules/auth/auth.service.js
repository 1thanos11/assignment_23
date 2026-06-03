import { startSession, Types } from "mongoose";
import { JobEnum, EmailEnum, ProviderEnum, NotificationTargetTypeEnum, NotificationTypeEnum, PushStatusEnum, } from "../../common/enums/index.js";
import { BadRequestError, ConflictError, NotFoundError, } from "../../common/errors/client.errors.js";
import { generateOtp } from "../../common/otp.js";
import { emailQueue } from "../../infra/queue/queues/email.queue.js";
import { redisService } from "../../common/services/redis.service.js";
import { securityService, tokenService } from "../../common/services/index.js";
import { emailTemplate } from "../../common/utils/email/template.email.js";
import { CLIENT_ID, OTP_SALT_ROUND } from "../../config/config.js";
import { ProfileRepository, SettingsRepository, StatsRepository, UserRepository, } from "../../infra/repository/index.js";
import { phoneValidator } from "../../common/validation/phone.validation.js";
import { platform } from "node:os";
import { notificationQueue } from "../../infra/queue/queues/notification.queue.js";
import { notificationService } from "../notification/notification.service.js";
import { OAuth2Client } from "google-auth-library";
import { InternalServerError } from "../../common/errors/server.errors.js";
class AuthService {
    redis = redisService;
    security = securityService;
    userRepository;
    profileRepository;
    settingsRepository;
    statsRepository;
    token = tokenService;
    notification = notificationService;
    constructor() {
        this.userRepository = new UserRepository();
        this.profileRepository = new ProfileRepository();
        this.settingsRepository = new SettingsRepository();
        this.statsRepository = new StatsRepository();
    }
    async sendMail({ email, subject, title, }) {
        const blockKey = this.redis.OtpBlockKey({ email, subject });
        const isBlockedTTL = await this.redis.ttl(blockKey);
        if (isBlockedTTL >= 0) {
            throw new ConflictError(`you are blocked please try again after ${isBlockedTTL} seconds`);
        }
        const maxAttemptsKey = this.redis.otpMaxAttemptsKey({
            email,
            subject,
        });
        const count = await this.redis.get(maxAttemptsKey);
        if (count && count > 3) {
            await this.redis.set({
                key: blockKey,
                value: 1,
                options: { expiration: { type: "EX", value: 10 * 60 } },
            });
        }
        await this.redis.incr(maxAttemptsKey);
        const otpKey = this.redis.otpKey({ email, subject });
        const isValidOtp = await this.redis.ttl(otpKey);
        if (isValidOtp >= 0) {
            throw new ConflictError("the previous otp is still valid");
        }
        const otp = await generateOtp();
        const hashedOtp = await this.security.hash({
            data: `${otp}`,
            rounds: OTP_SALT_ROUND,
        });
        await this.redis.set({
            key: otpKey,
            value: hashedOtp,
            options: { expiration: { type: "EX", value: 10 * 60 } },
        });
        await emailQueue.add(JobEnum.SEND_EMAIL, {
            to: email,
            subject,
            html: emailTemplate({ title, code: otp }),
        }, {
            attempts: 3,
            backoff: { type: "exponential", delay: 3000 },
            removeOnComplete: true,
            removeOnFail: false,
        });
    }
    async verifyGoogleAccount(idToken) {
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new BadRequestError("Fail to authenticate this account with google");
        }
        return payload;
    }
    async signupWithGmail(idToken) {
        const payload = await this.verifyGoogleAccount(idToken);
        const isUserExist = await this.userRepository.findOne({
            filter: { email: payload.email },
        });
        if (isUserExist) {
            if (isUserExist.provider !== ProviderEnum.GOOGLE) {
                throw new ConflictError("email already exist");
            }
            return {
                status: 200,
                credentials: await this.loginWithGmail(idToken),
            };
        }
        const session = await startSession();
        session.startTransaction();
        let user;
        try {
            user = await this.userRepository.createOne({
                data: {
                    email: payload.email,
                    provider: ProviderEnum.GOOGLE,
                    verifiedAt: new Date(),
                },
            });
            await this.profileRepository.createOne({
                data: {
                    ownerId: user?._id,
                    username: `${payload.given_name} ${payload.family_name}`,
                    avatarUrl: payload.profile,
                    DOB: new Date(),
                },
                options: { session },
            });
            await this.settingsRepository.createOne({
                data: { ownerId: user?._id },
                options: { session },
            });
            await this.statsRepository.createOne({
                data: { ownerId: user?._id },
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
        if (!user) {
            throw new InternalServerError(`Fail to signup please try again later`);
        }
        return {
            status: 201,
            credentials: await this.token.createLoginCredentials({
                user,
            }),
        };
    }
    async loginWithGmail(idToken) {
        const payload = await this.verifyGoogleAccount(idToken);
        const user = await this.userRepository.findOne({
            filter: {
                email: payload.email,
                confirmEmail: { $exists: true },
                provider: ProviderEnum.GOOGLE,
            },
        });
        if (!user) {
            throw new NotFoundError("user not found");
        }
        return await this.token.createLoginCredentials({ user });
    }
    async signup(inputs) {
        const { username, email, password, phone, gender, DOB, countryCode } = inputs;
        const isUserExist = await this.userRepository.findOne({
            filter: {
                email,
                paranoid: false,
                includeDeactivated: true,
                includeUnverified: true,
                includeBanned: true,
            },
        });
        if (isUserExist) {
            throw new ConflictError("email already exist");
        }
        let user;
        let validatedPhone;
        if (phone && countryCode) {
            validatedPhone = await phoneValidator({ countryCode, phone });
        }
        const session = await startSession();
        session.startTransaction();
        try {
            user = await this.userRepository.createOne({
                data: { email, password, phone: validatedPhone },
                options: { session },
            });
            await this.profileRepository.createOne({
                data: {
                    ownerId: user?._id,
                    username,
                    gender,
                    DOB: new Date(DOB),
                },
                options: { session },
            });
            await this.settingsRepository.createOne({
                data: { ownerId: user?._id },
                options: { session },
            });
            await this.statsRepository.createOne({
                data: { ownerId: user?._id },
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
        await this.sendMail({
            email,
            subject: EmailEnum.CONFIRM_EMAIL,
            title: "Verify your email",
        });
        return {
            message: "Otp sent successfully please check your gmail",
            data: { userEmail: email, _id: user?._id },
        };
    }
    async confirmEmail(inputs) {
        const { email, otp } = inputs;
        const user = await this.userRepository.findOne({
            filter: { email, onlyNotVerified: true, provider: ProviderEnum.SYSTEM },
        });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        const otpKey = this.redis.otpKey({
            email,
            subject: EmailEnum.CONFIRM_EMAIL,
        });
        const isExpiredOtp = await this.redis.get(otpKey);
        if (!isExpiredOtp) {
            throw new BadRequestError("Expired OTP");
        }
        const isValidOtp = await this.security.compare({
            data: otp,
            encrypted: isExpiredOtp,
        });
        if (!isValidOtp) {
            throw new BadRequestError("Wrong OTP");
        }
        user.verifiedAt = new Date();
        await user.save();
        const rateLimitKeys = await this.redis.scan({
            pattern: `${this.redis.emailRateLimitKey({ email, path: `confirmEmail` })}`,
        });
        const otpKeys = await this.redis.scan({ pattern: `${otpKey}*` });
        await this.redis.del([...rateLimitKeys, ...otpKeys]);
        return {
            message: "Email confirmed",
            data: { _id: user._id, userEmail: email },
        };
    }
    async resendConfirmEmailOtp(inputs) {
        const { email } = inputs;
        const user = await this.userRepository.findOne({
            filter: {
                email,
                onlyNotVerified: true,
            },
        });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        await this.sendMail({
            email,
            subject: EmailEnum.CONFIRM_EMAIL,
            title: "Confirm Email Otp",
        });
        return { message: "OTP sent successfully please check your gmail" };
    }
    async login(inputs) {
        const { email, password, FCM } = inputs;
        const user = await this.userRepository.findOne({ filter: { email } });
        if (!user) {
            throw new NotFoundError("Invalid login credentials");
        }
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            throw new NotFoundError("Invalid login credentials");
        }
        const { accessToken, refreshToken } = await this.token.createLoginCredentials({ user });
        const notificationDB = await this.notification.createOneNotification({
            recipientId: user._id,
            actorId: user._id,
            notificationType: NotificationTypeEnum.SYSTEM,
            notificationTargetType: NotificationTargetTypeEnum.USER,
            notificationTargetId: user._id,
            title: "new login",
            body: `there is new login from ${platform()}`,
            pushStatus: PushStatusEnum.PENDING,
        });
        const key = this.redis.FCMKey(user._id);
        await this.redis.sAdd({ key, members: FCM });
        await notificationQueue.add(JobEnum.SEND_MULTIPLE_NOTIFICATIONS, {
            userIds: [user._id],
            title: "new login",
            body: JSON.stringify({
                message: `there is new login from ${platform()}`,
                notificationId: notificationDB._id.toString(),
                userId: user._id,
            }),
            notificationId: notificationDB._id,
        });
        user.lastLoginAt = new Date();
        user.save();
        return {
            message: "Login successful",
            data: { accessToken, refreshToken, _id: user._id, userEmail: email },
        };
    }
    async forgotPassword(inputs) {
        const { email } = inputs;
        const user = await this.userRepository.findOne({
            filter: { email, provider: ProviderEnum.SYSTEM },
        });
        if (!user) {
            throw new NotFoundError("User not found may be it is wrong email");
        }
        await this.sendMail({
            email,
            subject: EmailEnum.FORGOT_PASSWORD,
            title: "forgot password otp",
        });
        return { message: "OTP Sent please check your gmail" };
    }
    async resetPassword(inputs) {
        const { otp, email, password } = inputs;
        const user = await this.userRepository.findOne({
            filter: { email, provider: ProviderEnum.SYSTEM },
        });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        const key = this.redis.otpKey({
            email,
            subject: EmailEnum.FORGOT_PASSWORD,
        });
        const isExpiredOtp = await this.redis.get(key);
        if (!isExpiredOtp) {
            throw new BadRequestError("Expired OTP");
        }
        const isCorrectOtp = await this.security.compare({
            data: otp,
            encrypted: isExpiredOtp,
        });
        if (!isCorrectOtp) {
            throw new BadRequestError("Wrong OTP");
        }
        user.password = password;
        user.changeCredentialsTime = new Date();
        await user.save();
        const keys = await this.redis.scan({
            pattern: `${this.redis.otpKey({ email, subject: EmailEnum.FORGOT_PASSWORD })}`,
        });
        await this.redis.del(keys);
        return { message: "password reset correctly" };
    }
}
export const authService = new AuthService();
