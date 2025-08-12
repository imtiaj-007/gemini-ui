"use client";

import React, { useState, useEffect } from 'react';
import ChatWindow from '@/components/chat/chat-window';
import { AutoScrollEffect } from '@/components/ui/gemini-effect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatStore } from '@/store/chat';
import { SendHorizonal } from 'lucide-react';


export default function DashboardPage() {
    const {
        chatrooms,
        activeChatroomId,
        setActiveChatroomId,
        createChatroom
    } = useChatStore();
    const [inputValue, setInputValue] = useState('');

    const handleCreateChatroom = () => {
        const newTitle = `chatroom-${chatrooms.length + 1}`;
        createChatroom(newTitle);
        setTimeout(()=> {
            setInputValue('');
        }, 2000);
    };

    useEffect(() => {
        setActiveChatroomId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className='relative w-full h-full p-4'>
            {activeChatroomId ? (
                <ChatWindow chatroomId={activeChatroomId} homeInput={inputValue} />
            ) : (
                <AutoScrollEffect
                    title='Chat with Pixel Pilot AI'
                    description='How can I help you today.'
                >
                    <div className="relative w-full max-w-xl mx-auto mt-10 z-10">
                        <div className="relative flex items-center h-12 rounded-full border border-neutral-600 dark:border-gray-600 overflow-hidden">
                            <Input
                                placeholder="Ask Pixel Pilot"
                                className="w-full h-full px-4 pr-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                onChange={(e) => setInputValue(e.target.value)}
                                value={inputValue}
                                aria-label="Chat input"
                                aria-describedby="chat-input-description"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && inputValue.trim()) {
                                        handleCreateChatroom();
                                    }
                                }}
                                autoFocus
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-1 rounded-full h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={handleCreateChatroom}
                                disabled={!inputValue.trim()}
                                aria-label="Send message"
                                aria-disabled={!inputValue.trim()}
                            >
                                <SendHorizonal className="h-4 w-4" />
                            </Button>
                        </div>
                        <p id="chat-input-description" className="sr-only">
                            Type your message to Pixel Pilot AI and press enter or click send
                        </p>
                    </div>
                </AutoScrollEffect>
            )}
        </div >
    );
}