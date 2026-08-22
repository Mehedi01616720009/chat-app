import { Avatar, Input, Modal } from "@heroui/react";
import { Search } from "lucide-react";
import { ReactNode } from "react";

interface NewChatModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    isSearching: boolean;
    searchResults: any[];
    onCreateChat: (userId: string) => void;
    children?: ReactNode;
}

export function NewChatModal({
    isOpen,
    onOpenChange,
    searchQuery,
    onSearchChange,
    isSearching,
    searchResults,
    onCreateChat,
    children,
}: NewChatModalProps) {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            {children}
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>New Chat</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="pb-6">
                            <div className="relative flex items-center">
                                <Search
                                    size={18}
                                    className="absolute left-3 text-default-400 pointer-events-none z-10"
                                />
                                <Input
                                    autoFocus
                                    placeholder="Search by name or phone..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        onSearchChange(e.target.value)
                                    }
                                    variant="primary"
                                    className="pl-10"
                                    fullWidth
                                />
                            </div>

                            <div className="max-h-[300px] mt-4 flex flex-col gap-2 overflow-y-auto">
                                {isSearching ? (
                                    <div className="text-center text-sm text-default-500 py-4">
                                        Searching...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((resultUser) => (
                                        <div
                                            key={resultUser.id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-default-100 transition-colors cursor-pointer"
                                            onClick={() =>
                                                onCreateChat(resultUser.id)
                                            }
                                        >
                                            <Avatar>
                                                <Avatar.Fallback>
                                                    {resultUser.name
                                                        ? resultUser.name
                                                              .charAt(0)
                                                              .toUpperCase()
                                                        : "U"}
                                                </Avatar.Fallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {resultUser.name}
                                                </span>
                                                <span className="text-xs text-default-500">
                                                    {resultUser.phone}
                                                </span>
                                            </div>
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
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
