import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { catchAsync } from "@/lib/catchAsync";

export const GET = catchAsync(
    async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
        const { id } = await params;
        const chat = await prisma.chat.findUnique({
            where: { id },
            include: {
                participants: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!chat) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(chat, { status: 200 });
    }
);
