"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserSchema } from "@/module/user/schema";
import { z } from "zod";

import {
    Input,
    Button,
    Card,
    CardHeader,
    CardFooter,
    Label,
    Alert,
} from "@heroui/react";

export default function LoginPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            // Validate form using Zod schema
            UserSchema.parse({ name, phone });

            setLoading(true);
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to login");
            }

            // Handle local storage and cookie session
            localStorage.setItem("isLoggedin", "true");
            localStorage.setItem("user", JSON.stringify(data));
            document.cookie = "isLoggedin=true; path=/; max-age=86400"; // 1 day

            router.push("/chat");
        } catch (err: unknown) {
            if (err instanceof z.ZodError) {
                setError(err.issues[0].message);
            } else if (err instanceof Error) {
                setError(err.message || "An unexpected error occurred.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm p-2 shadow-sm border border-border">
                <CardHeader className="flex flex-col items-center justify-center pb-0 pt-4 px-4 gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-default-500">
                        Enter your details to sign in to your account
                    </p>
                </CardHeader>

                <CardFooter className="overflow-visible px-4 py-6">
                    <form onSubmit={handleSubmit} className="grid gap-4 w-full">
                        {error && (
                            <Alert status="danger">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title>{error}</Alert.Title>
                                </Alert.Content>
                            </Alert>
                        )}

                        <Label>Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />

                        <Label>Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+880 1xxxxxxxxx"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={loading}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            isPending={loading}
                            className="mt-2 w-full font-medium"
                        >
                            Sign In
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
