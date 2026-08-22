import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { catchAsync } from "@/lib/catchAsync";
import { MessageCreateSchema } from "@/module/message/schema";

export const GET = catchAsync(async (req: NextRequest) => {
    const chatId = req.nextUrl.searchParams.get("chatId");
    const cursor = req.nextUrl.searchParams.get("cursor");

    if (!chatId) {
        return NextResponse.json(
            { error: "chatId query parameter is required" },
            { status: 400 },
        );
    }

    const messages = await prisma.message.findMany({
        where: { chatId },
        take: 50,
        skip: cursor ? 1 : 0,
        ...(cursor && { cursor: { id: cursor } }),
        orderBy: { createdAt: "desc" },
        include: { sender: true },
    });

    const ascendingMessages = messages.reverse();

    return NextResponse.json(ascendingMessages, { status: 200 });
});

export const POST = catchAsync(async (req: NextRequest) => {
    const body = await req.json();
    const { chatId, senderId, content } = MessageCreateSchema.parse(body);

    // Verify user is a participant
    const participant = await prisma.chatParticipant.findUnique({
        where: {
            chatId_userId: {
                chatId,
                userId: senderId,
            },
        },
    });

    if (!participant) {
        return NextResponse.json(
            { error: "User is not a participant in this chat" },
            { status: 403 },
        );
    }

    const message = await prisma.message.create({
        data: {
            content,
            chatId,
            senderId,
        },
        include: { sender: true },
    });

    // Notify via Socket.io
    const io = (global as any).io;
    if (io) {
        io.to(chatId).emit("new-message", message);
    }

    return NextResponse.json(message, { status: 200 });
});
