import { Avatar, Button, Input, Modal, ScrollShadow } from "@heroui/react";
import { UserPlus, Search, X, Check } from "lucide-react";
import { useState, useCallback } from "react";
import debounce from "debounce";

interface ChatInfoModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    chat: any;
    user: any;
    onUpdate: () => void;
}

export function ChatInfoModal({
    isOpen,
    onOpenChange,
    chat,
    user,
    onUpdate,
}: ChatInfoModalProps) {
    const [view, setView] = useState<"info" | "add">("info");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const isGroup = chat?.type === "GROUP";

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setView("info");
            setSearchQuery("");
            setSearchResults([]);
        }
        onOpenChange(open);
    };

    const handleRemoveParticipant = async (participantId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;

        try {
            const res = await fetch(
                `/api/chats/${chat.id}/remove-participant`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ participantId }),
                },
            );
            if (res.ok) {
                onUpdate();
                if (participantId === user.id) {
                    handleOpenChange(false);
                }
            }
        } catch (error) {
            console.error("Failed to remove participant", error);
        }
    };

    const handleAddParticipant = async (participantId: string) => {
        setIsAdding(true);
        try {
            const res = await fetch(`/api/chats/${chat.id}/add-participants`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participantIds: [participantId] }),
            });
            if (res.ok) {
                onUpdate();
                setView("info");
                setSearchQuery("");
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Failed to add participant", error);
        } finally {
            setIsAdding(false);
        }
    };

    const fetchUsers = useCallback(
        debounce(async (query: string) => {
            try {
                const res = await fetch(
                    `/api/users?search=${encodeURIComponent(query)}`,
                );
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Filter out already existing participants
                    const existingIds =
                        chat?.participants?.map((p: any) => p.userId) || [];
                    setSearchResults(
                        data.filter((u: any) => !existingIds.includes(u.id)),
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
        [chat],
    );

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        fetchUsers(query);
    };

    if (!chat) return null;

    let chatName = "Unknown";
    let fallback = "U";
    if (isGroup) {
        chatName = chat.name || "Group Chat";
        fallback = chatName.substring(0, 2).toUpperCase();
    } else {
        const otherParticipant = chat.participants?.find(
            (p: any) => p.userId !== user?.id,
        );
        if (otherParticipant?.user?.name) {
            chatName = otherParticipant.user.name;
            fallback = chatName.charAt(0).toUpperCase();
        }
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>
                                {view === "info" ? "Chat Info" : "Add Member"}
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="pb-6">
                            {view === "info" ? (
                                <div className="flex flex-col items-center">
                                    <Avatar className="w-20 h-20 text-large mb-4">
                                        <Avatar.Fallback>
                                            {fallback}
                                        </Avatar.Fallback>
                                    </Avatar>
                                    <h2 className="text-xl font-bold mb-6">
                                        {chatName}
                                    </h2>

                                    <div className="w-full flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-semibold text-default-500">
                                            {chat.participants?.length}{" "}
                                            Participants
                                        </h3>
                                        {isGroup && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onPress={() => setView("add")}
                                                className="gap-2"
                                            >
                                                <UserPlus size={16} />
                                                Add Member
                                            </Button>
                                        )}
                                    </div>

                                    <div className="w-full flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                                        {chat.participants?.map(
                                            (participant: any) => {
                                                const isMe =
                                                    participant.userId ===
                                                    user?.id;
                                                return (
                                                    <div
                                                        key={participant.id}
                                                        className="flex items-center justify-between p-2 rounded-lg bg-content2/50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar size="sm">
                                                                <Avatar.Fallback>
                                                                    {participant.user?.name
                                                                        ?.charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase()}
                                                                </Avatar.Fallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">
                                                                    {
                                                                        participant
                                                                            .user
                                                                            ?.name
                                                                    }{" "}
                                                                    {isMe &&
                                                                        "(You)"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {isGroup && (
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="danger"
                                                                onPress={() =>
                                                                    handleRemoveParticipant(
                                                                        participant.userId,
                                                                    )
                                                                }
                                                            >
                                                                <X size={16} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-[400px]">
                                    <div className="relative flex items-center mb-4 shrink-0">
                                        <Search
                                            size={18}
                                            className="absolute left-3 text-default-400 pointer-events-none z-10"
                                        />
                                        <Input
                                            autoFocus
                                            placeholder="Search to add..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                handleSearch(e.target.value)
                                            }
                                            variant="primary"
                                            className="pl-10"
                                            fullWidth
                                        />
                                    </div>

                                    <div className="flex-grow flex flex-col gap-2 overflow-y-auto">
                                        {isSearching ? (
                                            <div className="text-center text-sm text-default-500 py-4">
                                                Searching...
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((resultUser) => (
                                                <div
                                                    key={resultUser.id}
                                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-default-100 transition-colors justify-between"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <Avatar.Fallback>
                                                                {resultUser.name
                                                                    ? resultUser.name
                                                                          .charAt(
                                                                              0,
                                                                          )
                                                                          .toUpperCase()
                                                                    : "U"}
                                                            </Avatar.Fallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">
                                                                {
                                                                    resultUser.name
                                                                }
                                                            </span>
                                                            <span className="text-xs text-default-500">
                                                                {
                                                                    resultUser.phone
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onPress={() =>
                                                            handleAddParticipant(
                                                                resultUser.id,
                                                            )
                                                        }
                                                        isPending={isAdding}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            ))
                                        ) : searchQuery ? (
                                            <div className="text-center text-sm text-default-500 py-4">
                                                No users found.
                                            </div>
                                        ) : (
                                            <div className="text-center text-sm text-default-500 py-4">
                                                Type to search for users
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="mt-4 shrink-0"
                                        onPress={() => setView("info")}
                                    >
                                        Back to Info
                                    </Button>
                                </div>
                            )}
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
