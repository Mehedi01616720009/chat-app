import z from "zod";

export const UserSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    phone: z.string().min(1, "Phone number is required").max(20, "Phone is too long"),
});

export type UserSchemaType = z.infer<typeof UserSchema>;
