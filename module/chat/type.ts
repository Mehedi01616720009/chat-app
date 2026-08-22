import { User } from "@/module/user/type";
import { ChatType } from "@/generated/prisma/enums";

export interface Chat {
    id: string;
    name?: string | null;
    type: ChatType;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatParticipant {
    id: string;
    chatId: string;
    userId: string;
    joinedAt: Date;
    user: User;
}

export interface ChatWithDetails extends Chat {
    participants: ChatParticipant[];
    messages: ChatMessage[];
}

export interface ChatMessage {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
    sender: User;
}
