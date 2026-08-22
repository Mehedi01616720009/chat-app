import { Avatar, Input, Separator } from "@heroui/react";
import { ReactNode } from "react";
import { User } from "@/module/user/type";
import { ChatWithDetails } from "@/module/chat/type";

interface SidebarProps {
    user: User | null;
    chats: ChatWithDetails[];
    loadingChats: boolean;
    activeChatId: string | null;
    onChatSelect: (chatId: string) => void;
    newChatSlot?: ReactNode;
    newGroupSlot?: ReactNode;
}

export function Sidebar({
    user,
    chats,
    loadingChats,
    activeChatId,
    onChatSelect,
    newChatSlot,
    newGroupSlot,
}: SidebarProps) {
    return (
        <div className="w-80 flex-shrink-0 border-r border-border flex flex-col h-full bg-content1">
            <div className="p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Messages</h1>
                    <div className="flex gap-2">
                        {newChatSlot}
                        {newGroupSlot}
                    </div>
                </div>
                <Input placeholder="Search chats..." variant="primary" />
            </div>
            <Separator />
            <div className="flex-grow p-2 space-y-1 overflow-y-auto">
                {loadingChats ? (
                    <div className="p-4 text-center text-sm text-default-500">
                        Loading chats...
                    </div>
                ) : chats.length === 0 ? (
                    <div className="p-4 text-center text-sm text-default-500">
                        No chats found.
                    </div>
                ) : (
                    chats.map((chat) => {
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

                        const lastMessage = chat.messages?.[0];
                        const isUnread =
                            lastMessage &&
                            lastMessage.senderId !== user?.id &&
                            !lastMessage.isRead;

                        return (
                            <div
                                key={chat.id}
                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                                    activeChatId === chat.id
                                        ? "bg-default-200"
                                        : "hover:bg-default-100"
                                }`}
                                onClick={() => onChatSelect(chat.id)}
                            >
                                <Avatar>
                                    <Avatar.Fallback>
                                        {fallback}
                                    </Avatar.Fallback>
                                </Avatar>
                                <div className="flex flex-col flex-grow overflow-hidden">
                                    <span
                                        className={`text-sm ${isUnread ? "font-bold" : "font-medium"}`}
                                    >
                                        {chatName}
                                    </span>
                                    <span
                                        className={`text-xs truncate ${isUnread ? "font-bold text-foreground" : "text-default-500"}`}
                                    >
                                        {lastMessage
                                            ? lastMessage.content
                                            : "No messages yet"}
                                    </span>
                                </div>
                                <span
                                    className={`text-xs shrink-0 ${isUnread ? "font-bold text-primary" : "text-default-400"}`}
                                >
                                    {lastMessage
                                        ? new Date(
                                              chat.messages[0].createdAt,
                                          ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                          })
                                        : new Date(
                                              chat.createdAt,
                                          ).toLocaleDateString()}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
