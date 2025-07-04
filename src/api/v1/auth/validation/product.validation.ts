import z, { ZodSchema } from "zod";

export class ProductValidation {
    static readonly CREATE: ZodSchema = z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        price: z.number().positive("Price must be a positive number"),
        stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
        images: z.array(z.object({
            url: z.string(),
        })).optional(),
    });

    static readonly UPDATE: ZodSchema = z.object({
        name: z.string().min(1, "Name is required").optional(),
        description: z.string().optional(),
        price: z.number().positive("Price must be a positive number").optional(),
        stock: z.number().int().nonnegative("Stock must be a non-negative integer").optional(),
        newImages: z.array(z.object({
            url: z.string(),
        })).optional(),
        removeImages: z.array(z.number()).optional(),
    });
}