import { ChatType } from "@/generated/prisma/enums";

export interface Chat {
    id: string;
    name?: string;
    type: ChatType;
    createdAt: Date;
    updatedAt: Date;
}
