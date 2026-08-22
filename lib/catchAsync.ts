import { NextResponse, NextRequest } from "next/server";
import { ZodError } from "zod";

export const catchAsync = <T extends Request | NextRequest>(
    fn: (req: T, ...args: any[]) => Promise<NextResponse | Response> | NextResponse | Response
) => {
    return async (req: T, ...args: any[]) => {
        try {
            return await fn(req, ...args);
        } catch (error: any) {
            console.error("API Error:", error);

            if (error instanceof ZodError) {
                return NextResponse.json(
                    { error: "Validation Error", details: error.issues },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: error?.message || "Internal Server Error" },
                { status: error?.status || 500 }
            );
        }
    };
};
