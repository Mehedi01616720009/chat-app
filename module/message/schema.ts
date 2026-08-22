import { z } from "zod";

export const MessageCreateSchema = z.object({
    chatId: z.uuid(),
    senderId: z.uuid(),
    content: z.string().min(1, "Content cannot be empty"),
});

export type MessageCreateSchemaType = z.infer<typeof MessageCreateSchema>;
