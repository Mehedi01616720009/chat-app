import { Avatar, Input, Modal, Button } from "@heroui/react";
import { Search, Check, X } from "lucide-react";
import { ReactNode, useState } from "react";
import { User } from "@/module/user/type";

interface NewGroupModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    isSearching: boolean;
    searchResults: User[];
    onCreateGroup: (name: string, selectedIds: string[]) => void;
    children?: ReactNode;
}

export function NewGroupModal({
    isOpen,
    onOpenChange,
    searchQuery,
    onSearchChange,
    isSearching,
    searchResults,
    onCreateGroup,
    children,
}: NewGroupModalProps) {
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    // Reset state when modal closes
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setGroupName("");
            setSelectedUsers([]);
            onSearchChange("");
        }
        onOpenChange(open);
    };

    const toggleUser = (user: User) => {
        setSelectedUsers((prev) => {
            if (prev.find((u) => u.id === user.id)) {
                return prev.filter((u) => u.id !== user.id);
            }
            return [...prev, user];
        });
    };

    const handleCreate = () => {
        if (groupName.trim() && selectedUsers.length >= 2) {
            onCreateGroup(
                groupName.trim(),
                selectedUsers.map((u) => u.id),
            );
            handleOpenChange(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
            {children}
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>Create New Group</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="pb-4">
                            <Input
                                autoFocus
                                placeholder="Group Name"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                variant="primary"
                                fullWidth
                                className="mb-4"
                            />

                            <div className="relative flex items-center mb-2">
                                <Search
                                    size={18}
                                    className="absolute left-3 text-default-400 pointer-events-none z-10"
                                />
                                <Input
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

                            {/* Selected Users Chips */}
                            {selectedUsers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedUsers.map((u) => (
                                        <div
                                            key={u.id}
                                            className="flex items-center gap-1 bg-default-100 rounded-full px-3 py-1 text-sm"
                                        >
                                            <span>{u.name}</span>
                                            <button
                                                onClick={() => toggleUser(u)}
                                                className="text-default-500 hover:text-default-900 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="max-h-[250px] mt-2 flex flex-col gap-2 overflow-y-auto">
                                {isSearching ? (
                                    <div className="text-center text-sm text-default-500 py-4">
                                        Searching...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((resultUser) => {
                                        const isSelected = selectedUsers.some(
                                            (u) => u.id === resultUser.id,
                                        );
                                        return (
                                            <div
                                                key={resultUser.id}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-default-100 transition-colors cursor-pointer justify-between"
                                                onClick={() =>
                                                    toggleUser(resultUser)
                                                }
                                            >
                                                <div className="flex items-center gap-3">
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
                                                {isSelected && (
                                                    <div className="text-primary pr-2">
                                                        <Check size={18} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
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
                        <Modal.Footer>
                            <Button
                                variant="primary"
                                onPress={handleCreate}
                                isDisabled={
                                    !groupName.trim() ||
                                    selectedUsers.length < 2
                                }
                                fullWidth
                            >
                                Create Group
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
