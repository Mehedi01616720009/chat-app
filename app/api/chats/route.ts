import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { catchAsync } from "@/lib/catchAsync";
import { ChatType } from "@/generated/prisma/enums";
import { ChatCreateSchema } from "@/module/chat/schema";

export const GET = catchAsync(async (req: NextRequest) => {
    const userId = req.nextUrl.searchParams.get("userId");
    
    if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const chats = await prisma.chat.findMany({
        where: {
            participants: {
                some: {
                    userId: userId as string,
                },
            },
        },
        include: {
            participants: {
                include: {
                    user: true,
                },
            },
            messages: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 1,
            },
        },
        orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(chats, { status: 200 });
});

export const POST = catchAsync(async (req: Request) => {
    const body = await req.json();
    const { name, participantIds } = ChatCreateSchema.parse(body);

    const users = await prisma.user.findMany({
        where: { id: { in: participantIds } },
    });
    if (users.length !== participantIds.length) {
        return NextResponse.json(
            { error: "Invalid participants" },
            { status: 400 },
        );
    }

    let type: ChatType = ChatType.ONE_TO_ONE;
    if (name) {
        type = ChatType.GROUP;
        if (participantIds.length < 3) {
            return NextResponse.json(
                { error: "Group chat must have at least 3 participants" },
                { status: 400 },
            );
        }
    }

    const result = await prisma.$transaction(async (tx) => {
        const chat = await tx.chat.create({
            data: {
                name,
                type,
            },
        });

        const participants = participantIds.map((participantId) => ({
            chatId: chat.id,
            userId: participantId,
        }));

        await tx.chatParticipant.createMany({
            data: participants,
        });

        return chat;
    });

    return NextResponse.json(result, { status: 200 });
});
