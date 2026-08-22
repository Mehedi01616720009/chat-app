import z from "zod";

export const ChatCreateSchema = z.object({
    name: z.string().optional(),
    participantIds: z.array(z.uuid()),
});

export const ChatAddParticipantsSchema = z.object({
    participantIds: z.array(z.uuid()),
});

export const ChatRemoveParticipantSchema = z.object({
    participantId: z.uuid(),
});

export type ChatCreateSchemaType = z.infer<typeof ChatCreateSchema>;
export type ChatAddParticipantsSchemaType = z.infer<
    typeof ChatAddParticipantsSchema
>;
export type ChatRemoveParticipantSchemaType = z.infer<
    typeof ChatRemoveParticipantSchema
>;
