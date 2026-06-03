import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";
class AuthValidationSchema {
    signup = z
        .strictObject({
        email: generalValidationFields.email,
        password: generalValidationFields.password,
        phone: generalValidationFields.phone.optional(),
        countryCode: generalValidationFields.countryCode.optional(),
        username: generalValidationFields.string(3, 25),
        gender: generalValidationFields.gender,
        DOB: generalValidationFields.nullString,
    })
        .superRefine((fields, ctx) => {
        if (fields.phone && !fields.countryCode) {
            ctx.addIssue({
                code: "custom",
                path: ["countryCode"],
                message: "countryCode is required when phone is provided",
            });
        }
    });
    confirmEmail = z.strictObject({
        email: generalValidationFields.email,
        otp: generalValidationFields.otp,
    });
    resendConfirmEmailOtp = z.strictObject({
        email: generalValidationFields.email,
    });
    login = z.strictObject({
        email: generalValidationFields.email,
        password: generalValidationFields.password,
        FCM: generalValidationFields.nullString,
    });
    forgotPassword = z.strictObject({
        email: generalValidationFields.email,
    });
    resetPassword = z
        .strictObject({
        email: generalValidationFields.email,
        otp: generalValidationFields.otp,
        password: generalValidationFields.password,
        confirmPassword: generalValidationFields.password,
    })
        .refine((fields) => {
        return fields.confirmPassword == fields.password;
    }, { error: "invalid confirm password" });
}
export const authValidationSchema = new AuthValidationSchema();
