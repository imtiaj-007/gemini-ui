import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MessageType } from '@/components/chat/message';

export type Chatroom = {
    id: string;
    title: string;
    messages: MessageType[];
};

interface ChatState {
    chatrooms: Chatroom[];
    activeChatroomId: string | null;
    createChatroom: (title: string) => void;
    deleteChatroom: (id: string) => void;
    setActiveChatroomId: (id: string | null) => void;
    addMessage: (chatroomId: string, message: MessageType) => void;
    getChatroom: (id: string) => Chatroom | undefined;
    renameChatroom: (id: string, newTitle: string) => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            chatrooms: [],
            activeChatroomId: null,
            createChatroom: (title) => {
                const newChatroom: Chatroom = {
                    id: Date.now().toString(),
                    title,
                    messages: [],
                };
                set((state) => ({
                    chatrooms: [...state.chatrooms, newChatroom],
                    activeChatroomId: newChatroom.id
                }));
            },
            deleteChatroom: (id) => {
                set((state) => ({
                    chatrooms: state.chatrooms.filter((room) => room.id !== id),
                    activeChatroomId: state.activeChatroomId === id ? null : state.activeChatroomId,
                }));
            },
            setActiveChatroomId: (id) => set({ activeChatroomId: id }),
            addMessage: (chatroomId, message) => {
                set((state) => ({
                    chatrooms: state.chatrooms.map((room) =>
                        room.id === chatroomId
                            ? { ...room, messages: [...room.messages, message] }
                            : room
                    ),
                }));
            },
            getChatroom: (id) => {
                return get().chatrooms.find(room => room.id === id);
            },
            renameChatroom: (id, newTitle) => {
                set((state) => ({
                    chatrooms: state.chatrooms.map((room) =>
                        room.id === id
                            ? { ...room, title: newTitle }
                            : room
                    ),
                }));
            }
        }),
        {
            name: 'chat-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);