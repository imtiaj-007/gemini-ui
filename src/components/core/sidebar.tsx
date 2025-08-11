"use client";

import { useState } from 'react';
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

    const handleRenameChatRoom = (id: string, newTitle: string) => {
        renameChatroom(id, newTitle);
        toast.info("Chatroom renamed from ")
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
                            handleRenameChatroom={handleRenameChatRoom}
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
                    handleRenameChatroom={handleRenameChatRoom}
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
    handleRenameChatRoom,
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
    const [renameInput, setRenameInput] = useState('');

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
                                <DropdownMenuItem><Pencil /> Rename</DropdownMenuItem>
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
        </>
    );
}