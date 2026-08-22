import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { catchAsync } from "@/lib/catchAsync";
import { UserSchema } from "@/module/user/schema";
import { Prisma } from "@/generated/prisma/client";

export const GET = catchAsync(async (req: NextRequest) => {
    const search = req.nextUrl.searchParams.get("search");

    const where: Prisma.UserWhereInput = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
        ];
    }

    const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users, { status: 200 });
});

export const POST = catchAsync(async (req: Request) => {
    const body = await req.json();
    const { name, phone } = UserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
        where: { phone },
    });
    if (existingUser) {
        return NextResponse.json(existingUser, { status: 200 });
    }

    const user = await prisma.user.create({
        data: {
            name,
            phone,
        },
    });

    return NextResponse.json(user, { status: 200 });
});
