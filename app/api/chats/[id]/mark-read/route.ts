import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { catchAsync } from "@/lib/catchAsync";

export const PATCH = catchAsync(
    async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
        const { id } = await params;
        const chatId = id;
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        const result = await prisma.message.updateMany({
            where: {
                chatId: chatId,
                senderId: { not: userId },
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        return NextResponse.json({ count: result.count }, { status: 200 });
    }
);
