"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import debounce from "debounce";
import { Sidebar } from "./components/Sidebar";
import { MainChat } from "./components/MainChat";
import { NewChatModal } from "./components/NewChatModal";
import { NewGroupModal } from "./components/NewGroupModal";
import { Button } from "@heroui/react";
import { MessageSquarePlus, Users } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { User } from "@/module/user/type";
import { ChatWithDetails, ChatMessage } from "@/module/chat/type";

function ChatPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeChatId = searchParams.get("chatId") || searchParams.get("userId"); // Support both mentally

    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const s = io();
        setSocket(s);
        return () => {
            s.disconnect();
        };
    }, []);
    const [user, setUser] = useState<User | null>(null);
    const [chats, setChats] = useState<ChatWithDetails[]>([]);
    const [loadingChats, setLoadingChats] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [fetchedChat, setFetchedChat] = useState<ChatWithDetails | null>(null);

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

    const markChatAsRead = useCallback(async (chatId: string, currentUserId: string) => {
        try {
            await fetch(`/api/chats/${chatId}/mark-read`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId }),
            });
            
            setChats((prev) => 
                prev.map((c) => {
                    if (c.id === chatId && c.messages && c.messages.length > 0) {
                        return {
                            ...c,
                            messages: [
                                {
                                    ...c.messages[0],
                                    isRead: true,
                                }
                            ]
                        };
                    }
                    return c;
                })
            );
        } catch (e) {
            console.error("Failed to mark chat as read", e);
        }
    }, []);

    useEffect(() => {
        if (activeChatId && user) {
            const chat = chats.find(c => c.id === activeChatId);
            const lastMessage = chat?.messages?.[0];
            if (lastMessage && lastMessage.senderId !== user.id && !lastMessage.isRead) {
                markChatAsRead(activeChatId, user.id);
            }
        }
    }, [activeChatId, user, chats, markChatAsRead]);

    useEffect(() => {
        if (!socket) return;
        
        const handleNewMessage = (msg: ChatMessage) => {
            const isForActiveChat = msg.chatId === activeChatId;
            const isFromMe = msg.senderId === user?.id;
            
            if (isForActiveChat && !isFromMe && user) {
                msg.isRead = true;
                markChatAsRead(msg.chatId, user.id);
            }

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
    }, [socket, activeChatId, user, markChatAsRead]);

    const fetchUsers = useCallback(
        debounce(async (query: string, currentUserId: string) => {
            try {
                const res = await fetch(
                    `/api/users?search=${encodeURIComponent(query)}`,
                );
                const data = await res.json();
                if (Array.isArray(data)) {
                    setSearchResults(
                        data.filter((u: User) => u.id !== currentUserId),
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
        if (user) {
            fetchUsers(query, user.id);
        }
    };

    const handleCreateChat = async (selectedUserId: string) => {
        if (!user) return;
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

    const handleCreateGroup = async (name: string, selectedUserIds: string[]) => {
        if (!user) return;
        try {
            const res = await fetch("/api/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    participantIds: [user.id, ...selectedUserIds],
                }),
            });
            if (res.ok) {
                setIsGroupModalOpen(false);
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

    const activeChatFromList = chats.find((c) => c.id === activeChatId) || null;

    useEffect(() => {
        if (activeChatId && !activeChatFromList) {
            fetch(`/api/chats/${activeChatId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data && !data.error) {
                        setFetchedChat(data);
                    }
                })
                .catch(console.error);
        } else {
            setFetchedChat(null);
        }
    }, [activeChatId, activeChatFromList]);

    const activeChat = activeChatFromList || fetchedChat;

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
                newGroupSlot={
                    <NewGroupModal
                        isOpen={isGroupModalOpen}
                        onOpenChange={setIsGroupModalOpen}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearch}
                        isSearching={isSearching}
                        searchResults={searchResults}
                        onCreateGroup={handleCreateGroup}
                    >
                        <Button
                            isIconOnly
                            size="sm"
                            variant="primary"
                            onPress={() => setIsGroupModalOpen(true)}
                            aria-label="New Group"
                        >
                            <Users size={18} />
                        </Button>
                    </NewGroupModal>
                }
            />

            <MainChat 
                user={user} 
                chat={activeChat} 
                socket={socket} 
                onChatUpdate={() => user && loadChats(user.id)}
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
