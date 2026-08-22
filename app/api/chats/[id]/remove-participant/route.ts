import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { catchAsync } from "@/lib/catchAsync";
import { ChatRemoveParticipantSchema } from "@/module/chat/schema";
import { ChatType } from "@/generated/prisma/enums";

export const PATCH = catchAsync(
    async (req: NextRequest, { params }: { params: { id: string } }) => {
        const chatId = params.id;
        const body = await req.json();
        const { participantId } = ChatRemoveParticipantSchema.parse(body);

        const users = await prisma.user.findUnique({
            where: { id: participantId },
        });
        if (!users) {
            return NextResponse.json(
                { error: "Invalid participant" },
                { status: 400 },
            );
        }

        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
        });
        if (!chat) {
            return NextResponse.json(
                { error: "Not found this chat" },
                { status: 404 },
            );
        }

        if (chat.type === ChatType.ONE_TO_ONE) {
            return NextResponse.json(
                {
                    error: "You can not remove participants from a one-to-one chat",
                },
                { status: 400 },
            );
        }

        await prisma.chatParticipant.delete({
            where: {
                chatId_userId: {
                    chatId: chat.id,
                    userId: participantId,
                },
            },
        });

        return NextResponse.json(chat, { status: 200 });
    },
);
