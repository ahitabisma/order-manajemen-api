import z, { ZodSchema } from "zod";

export class AuthValidation {
    // REGISTER validation schema
    static readonly REGISTER: ZodSchema = z.object({
        name: z.string().min(2, { message: "Name must be at least 2 characters long" }).max(100, { message: "Name must not exceed 100 characters" }),
        email: z.string().email(),
        password: z.string().min(6, { message: "Password must be at least 6 characters long" }).max(100, { message: "Password must not exceed 100 characters" }),
        confirmPassword: z.string().min(6, { message: "Confirm Password must be at least 6 characters long" }).max(100, { message: "Confirm Password must not exceed 100 characters" }),
        photo: z.string().optional(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Password and confirm password do not match",
        path: ["confirmPassword"],
    });

    // LOGIN validation schema
    static readonly LOGIN: ZodSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6, { message: "Password must be at least 6 characters long" }).max(100, { message: "Password must not exceed 100 characters" }),
    });

    // UPDATE PROFILE validation schema
    static readonly UPDATE_PROFILE: ZodSchema = z.object({
        name: z.string().min(2, { message: "Name must be at least 2 characters long" }).max(100, { message: "Name must not exceed 100 characters" }).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6, { message: "Password must be at least 6 characters long" }).max(100, { message: "Password must not exceed 100 characters" }).optional(),
        confirmPassword: z.string().min(6, { message: "Confirm Password must be at least 6 characters long" }).max(100, { message: "Confirm Password must not exceed 100 characters" }).optional(),
        photo: z.string().optional(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Password and confirm password do not match",
        path: ["confirmPassword"],
    });
}