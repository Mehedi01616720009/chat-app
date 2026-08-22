import { Avatar, Button, Input } from "@heroui/react";
import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";
import { ChatInfoModal } from "./ChatInfoModal";
import { User } from "@/module/user/type";
import { ChatWithDetails, ChatMessage } from "@/module/chat/type";

interface MainChatProps {
    user: User | null;
    chat: ChatWithDetails | null;
    socket: Socket | null;
    onChatUpdate: () => void;
}

export function MainChat({ user, chat, socket, onChatUpdate }: MainChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chat || !user) {
            setMessages([]);
            setHasMore(false);
            return;
        }

        setIsLoading(true);
        fetch(`/api/messages?chatId=${chat.id}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setMessages(data);
                    setHasMore(data.length === 50);
                    setTimeout(() => {
                        if (scrollRef.current) {
                            scrollRef.current.scrollTop =
                                scrollRef.current.scrollHeight;
                        }
                    }, 50);
                }
            })
            .catch((err) => console.error("Error fetching messages:", err))
            .finally(() => setIsLoading(false));

        if (socket) {
            socket.emit("join-chat", chat.id);

            const handleNewMessage = (msg: ChatMessage) => {
                setMessages((prev) => [...prev, msg]);
                setTimeout(() => {
                    if (scrollRef.current) {
                        const { scrollTop, scrollHeight, clientHeight } =
                            scrollRef.current;
                        if (scrollHeight - scrollTop - clientHeight < 200) {
                            scrollRef.current.scrollTop =
                                scrollRef.current.scrollHeight;
                        }
                    }
                }, 50);
            };

            socket.on("new-message", handleNewMessage);

            return () => {
                socket.emit("leave-chat", chat.id);
                socket.off("new-message", handleNewMessage);
            };
        }
    }, [chat, user, socket]);

    const loadPreviousMessages = async () => {
        if (!hasMore || isLoadingMore || messages.length === 0 || !chat) return;
        setIsLoadingMore(true);
        const oldestMessageId = messages[0].id;

        try {
            const res = await fetch(
                `/api/messages?chatId=${chat.id}&cursor=${oldestMessageId}`,
            );
            const data: ChatMessage[] = await res.json();
            if (Array.isArray(data)) {
                setHasMore(data.length === 50);

                if (scrollRef.current) {
                    const scrollNode = scrollRef.current;
                    const previousScrollHeight = scrollNode.scrollHeight;

                    setMessages((prev) => [...data, ...prev]);

                    setTimeout(() => {
                        const newScrollHeight = scrollNode.scrollHeight;
                        scrollNode.scrollTop =
                            newScrollHeight -
                            previousScrollHeight +
                            scrollNode.scrollTop;
                    }, 0);
                } else {
                    setMessages((prev) => [...data, ...prev]);
                }
            }
        } catch (error) {
            console.error("Error loading more messages:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !chat || !user) return;

        const content = newMessage.trim();
        setNewMessage(""); // optimistic clear

        try {
            await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatId: chat.id,
                    senderId: user.id,
                    content,
                }),
            });
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop =
                        scrollRef.current.scrollHeight;
                }
            }, 50);
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    if (!chat) {
        return (
            <div className="flex-grow flex flex-col h-full bg-content2/30 items-center justify-center text-default-500">
                Select a chat to start messaging
            </div>
        );
    }

    let chatName = "Unknown";
    let fallback = "U";
    if (chat.type === "GROUP") {
        chatName = chat.name || "Group Chat";
        fallback = chatName.substring(0, 2).toUpperCase();
    } else {
        const otherParticipant = chat.participants?.find(
            (p) => p.userId !== user?.id,
        );
        if (otherParticipant?.user?.name) {
            chatName = otherParticipant.user.name;
            fallback = chatName.charAt(0).toUpperCase();
        }
    }

    return (
        <div className="flex-grow flex flex-col h-full bg-content2/30">
            {/* Chat Header */}
            <div className="h-16 border-b border-border flex items-center px-6 justify-between bg-content1 shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <Avatar.Fallback>{fallback}</Avatar.Fallback>
                    </Avatar>
                    <div>
                        <h2 className="text-sm font-semibold">{chatName}</h2>
                    </div>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => setIsInfoModalOpen(true)}
                >
                    Info
                </Button>
            </div>

            <ChatInfoModal
                isOpen={isInfoModalOpen}
                onOpenChange={setIsInfoModalOpen}
                chat={chat}
                user={user}
                onUpdate={onChatUpdate}
            />

            {/* Chat Messages */}
            <div
                className="flex-grow p-6 flex flex-col gap-4 overflow-y-auto"
                ref={scrollRef}
            >
                {isLoading ? (
                    <div className="text-center text-sm text-default-500 py-4">
                        Loading messages...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-default-500 py-4">
                        No messages yet. Send one!
                    </div>
                ) : (
                    <>
                        {hasMore && (
                            <div className="flex justify-center my-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs text-default-500 bg-content2 hover:bg-content3 transition-colors"
                                    onPress={loadPreviousMessages}
                                    isPending={isLoadingMore}
                                >
                                    Load previous messages
                                </Button>
                            </div>
                        )}
                        {messages.map((msg) => {
                            const isMe = msg.senderId === user?.id;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 max-w-[80%] ${isMe ? "self-end flex-row-reverse" : ""}`}
                                >
                                    {!isMe && (
                                        <Avatar>
                                            <Avatar.Fallback>
                                                {msg.sender?.name
                                                    ? msg.sender.name
                                                          .charAt(0)
                                                          .toUpperCase()
                                                    : "U"}
                                            </Avatar.Fallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={`flex flex-col gap-1 ${isMe ? "items-end" : ""}`}
                                    >
                                        <div
                                            className={`p-3 rounded-2xl text-sm shadow-sm ${
                                                isMe
                                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                    : "bg-content1 border border-border rounded-tl-sm"
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                        <span
                                            className={`text-[10px] text-default-400 ${isMe ? "mr-1" : "ml-1"}`}
                                        >
                                            {new Date(
                                                msg.createdAt,
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            {/* Chat Input */}
            <div className="p-4 pr-24 bg-content1 border-t border-border shrink-0">
                {chat.participants?.some((p) => p.userId === user?.id) ? (
                    <form
                        className="flex gap-2 items-center"
                        onSubmit={handleSendMessage}
                    >
                        <Input
                            placeholder="Type a message..."
                            variant="secondary"
                            fullWidth
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            className="font-medium"
                            isDisabled={!newMessage.trim()}
                        >
                            Send
                        </Button>
                    </form>
                ) : (
                    <div className="text-center text-sm text-danger font-medium py-2 bg-danger/10 rounded-lg">
                        You are no longer a participant in this chat.
                    </div>
                )}
            </div>
        </div>
    );
}
