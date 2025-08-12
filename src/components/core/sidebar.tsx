"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form"
import {
    PlusCircle,
    MessageSquare,
    Trash2,
    LogOut,
    MoreHorizontal,
    Inbox,
    Pencil,
    Share2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from '@/components/ui/form';
import { useDebounce } from '@/hooks/use-debounce';
import { useSidebar } from '@/context/sidebar-context';
import { Chatroom, useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';


export default function Sidebar() {
    const {
        chatrooms,
        activeChatroomId,
        setActiveChatroomId,
        renameChatroom,
        deleteChatroom
    } = useChatStore();
    const { logout } = useAuthStore();
    const { isOpen, toggleSidebar } = useSidebar();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredChatrooms = chatrooms.filter(room =>
        room.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    const handleRenameChatroom = (id: string, newTitle: string) => {
        renameChatroom(id, newTitle);
        toast.info(`Chatroom renamed to ${newTitle}`);
    }

    const handleDeleteChatroom = (id: string, title: string) => {
        deleteChatroom(id);
        toast.error("Chatroom Deleted!", {
            description: `"${title}" has been deleted.`
        });
    };

    return (
        <>
            <div className="md:hidden md:p-2">
                <Sheet open={isOpen} onOpenChange={toggleSidebar} >
                    <SheetContent side="left" className="w-[300px] p-4">
                        <SidebarContent
                            filteredChatrooms={filteredChatrooms}
                            activeChatroomId={activeChatroomId}
                            setActiveChatroomId={setActiveChatroomId}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            handleRenameChatroom={handleRenameChatroom}
                            handleDeleteChatroom={handleDeleteChatroom}
                            logout={logout}
                        />
                    </SheetContent>
                </Sheet>
            </div>
            <aside className="hidden md:flex w-64 bg-white dark:bg-gray-800 p-4 flex-col">
                <SidebarContent
                    filteredChatrooms={filteredChatrooms}
                    activeChatroomId={activeChatroomId}
                    setActiveChatroomId={setActiveChatroomId}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    handleRenameChatroom={handleRenameChatroom}
                    handleDeleteChatroom={handleDeleteChatroom}
                    logout={logout}
                />
            </aside>
        </>
    );
}

function SidebarContent({
    filteredChatrooms,
    activeChatroomId,
    setActiveChatroomId,
    searchTerm,
    setSearchTerm,
    handleRenameChatroom,
    handleDeleteChatroom,
    logout
}: {
    filteredChatrooms: Chatroom[],
    activeChatroomId: string | null,
    setActiveChatroomId: (id: string | null) => void,
    searchTerm: string,
    setSearchTerm: (term: string) => void,
    handleRenameChatroom: (id: string, title: string) => void,
    handleDeleteChatroom: (id: string, title: string) => void,
    logout: () => void
}) {
    const { closeSidebar } = useSidebar();
    const [renameDialogRoom, setRenameDialogRoom] = useState<Chatroom | null>(null);

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Chats</h1>
            <Button
                type='button'
                className="w-full mb-2"
                onClick={() => {
                    setActiveChatroomId(null);
                    closeSidebar();
                }}
            >
                <PlusCircle className="mr-2 h-4 w-4" /> New Chat
            </Button>

            <Input
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
            />

            <div className="flex-1 overflow-y-auto">
                {filteredChatrooms.map(room => (
                    <div
                        key={room.id}
                        className={cn(
                            "flex items-center justify-between px-2 rounded-md cursor-pointer",
                            activeChatroomId === room.id
                                ? "bg-blue-100 dark:bg-blue-900"
                                : "hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                        onClick={() => {
                            setActiveChatroomId(room.id);
                            closeSidebar();
                        }}
                    >
                        <div className="flex items-center text-sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span>{room.title}</span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full h-8 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <MoreHorizontal className='size-4' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='start' side='right'>
                                <DropdownMenuItem><Share2 /> Share</DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setRenameDialogRoom(room);
                                    }}
                                >
                                    <Pencil /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem><Inbox /> Archive</DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteChatroom(room.id, room.title);
                                    }}
                                    className='text-red-500'
                                >
                                    <Trash2 className='text-red-500' /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </div>
            <Button variant="outline" onClick={logout} className="mt-4">
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>

            {renameDialogRoom &&
                <RenameDialog
                    open={renameDialogRoom !== null}
                    onOpenChange={() => setRenameDialogRoom(null)}
                    data={renameDialogRoom}
                    onRename={handleRenameChatroom}
                />
            }
        </>
    );
}

interface RenameDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: Chatroom;
    onRename: (id: string, newName: string) => void
    title?: string
    description?: string
}

export function RenameDialog({
    open,
    onOpenChange,
    data,
    onRename,
    title = "Rename Chatroom",
    description = "Enter a new name",
}: RenameDialogProps) {
    const form = useForm({
        defaultValues: {
            name: data.title,
        },
    })

    const handleSubmit = form.handleSubmit((value) => {
        onRename(data.id, value.name);
        onOpenChange(false)
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            rules={{
                                required: "Name is required",
                                validate: (value) => value.trim().length > 0 || "Name cannot be empty",
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Rename</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}