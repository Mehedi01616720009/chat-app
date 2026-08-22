import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { catchAsync } from "@/lib/catchAsync";

export const GET = catchAsync(
    async (_req: Request, { params }: { params: { id: string } }) => {
        const { id } = params;

        const user = await prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(user, { status: 200 });
    },
);
