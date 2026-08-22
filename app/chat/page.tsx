"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import debounce from "debounce";
import { Sidebar } from "./components/Sidebar";
import { MainChat } from "./components/MainChat";
import { NewChatModal } from "./components/NewChatModal";
import { Button } from "@heroui/react";
import { MessageSquarePlus } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";

function ChatPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeChatId = searchParams.get("chatId") || searchParams.get("userId"); // Support both mentally

    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        const s = io();
        setSocket(s);
        return () => {
            s.disconnect();
        };
    }, []);
    const [user, setUser] = useState<any>(null);
    const [chats, setChats] = useState<any[]>([]);
    const [loadingChats, setLoadingChats] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const loadChats = useCallback((userId: string) => {
        fetch(`/api/chats?userId=${userId}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setChats(data);
                }
            })
            .catch((err) => console.error("Failed to fetch chats:", err))
            .finally(() => setLoadingChats(false));
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            loadChats(parsedUser.id);
        }
    }, [loadChats]);

    useEffect(() => {
        if (socket && chats.length > 0) {
            chats.forEach((chat) => {
                socket.emit("join-chat", chat.id);
            });
        }
    }, [socket, chats]);

    useEffect(() => {
        if (!socket) return;
        
        const handleNewMessage = (msg: any) => {
            setChats((prev) => {
                const chatIndex = prev.findIndex((c) => c.id === msg.chatId);
                if (chatIndex === -1) return prev;
                
                const newChats = [...prev];
                const updatedChat = {
                    ...newChats[chatIndex],
                    messages: [msg],
                    updatedAt: msg.createdAt,
                };
                
                newChats.splice(chatIndex, 1);
                newChats.unshift(updatedChat);
                return newChats;
            });
        };
        
        socket.on("new-message", handleNewMessage);
        
        return () => {
            socket.off("new-message", handleNewMessage);
        };
    }, [socket]);

    const fetchUsers = useCallback(
        debounce(async (query: string, currentUserId: string) => {
            try {
                const res = await fetch(
                    `/api/users?search=${encodeURIComponent(query)}`,
                );
                const data = await res.json();
                if (Array.isArray(data)) {
                    setSearchResults(
                        data.filter((u: any) => u.id !== currentUserId),
                    );
                } else {
                    setSearchResults([]);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsSearching(false);
            }
        }, 400),
        [],
    );

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        fetchUsers(query, user?.id);
    };

    const handleCreateChat = async (selectedUserId: string) => {
        try {
            const res = await fetch("/api/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    participantIds: [user.id, selectedUserId],
                }),
            });
            if (res.ok) {
                setIsModalOpen(false);
                setSearchQuery("");
                setSearchResults([]);
                loadChats(user.id);
                const chatData = await res.json();
                router.push(`?chatId=${chatData.id}`);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const activeChat = chats.find((c) => c.id === activeChatId) || null;

    return (
        <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
            <Sidebar
                user={user}
                chats={chats}
                loadingChats={loadingChats}
                activeChatId={activeChatId}
                onChatSelect={(id) => router.push(`?chatId=${id}`)}
                newChatSlot={
                    <NewChatModal
                        isOpen={isModalOpen}
                        onOpenChange={setIsModalOpen}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearch}
                        isSearching={isSearching}
                        searchResults={searchResults}
                        onCreateChat={handleCreateChat}
                    >
                        <Button
                            isIconOnly
                            size="sm"
                            variant="primary"
                            onPress={() => setIsModalOpen(true)}
                            aria-label="New Chat"
                        >
                            <MessageSquarePlus size={18} />
                        </Button>
                    </NewChatModal>
                }
            />

            <MainChat 
                user={user} 
                chat={activeChat} 
                socket={socket} 
            />
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex h-[100dvh] items-center justify-center">Loading...</div>}>
            <ChatPageContent />
        </Suspense>
    );
}
