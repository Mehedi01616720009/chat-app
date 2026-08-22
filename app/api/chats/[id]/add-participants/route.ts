import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { catchAsync } from "@/lib/catchAsync";
import { ChatAddParticipantsSchema } from "@/module/chat/schema";
import { ChatType } from "@/generated/prisma/enums";

export const PATCH = catchAsync(
    async (req: NextRequest, { params }: { params: { chatId: string } }) => {
        const { chatId } = params;
        const body = await req.json();
        const { participantIds } = ChatAddParticipantsSchema.parse(body);

        const users = await prisma.user.findMany({
            where: { id: { in: participantIds } },
        });
        if (users.length !== participantIds.length) {
            return NextResponse.json(
                { error: "Invalid participants" },
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
                { error: "You can not add participants to a one-to-one chat" },
                { status: 400 },
            );
        }

        const participants = participantIds.map((participantId) => ({
            chatId: chat.id,
            userId: participantId,
        }));

        await prisma.chatParticipant.createMany({
            data: participants,
            skipDuplicates: true,
        });

        return NextResponse.json(chat, { status: 200 });
    },
);
