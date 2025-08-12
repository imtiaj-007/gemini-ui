/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from "motion/react"
import Message, { MessageType } from '@/components/chat/message';
import ChatInput from '@/components/chat/chat-input';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatStore } from '@/store/chat'; 


export default function ChatWindow({ chatroomId, homeInput }: { chatroomId: string, homeInput?: string }) {
    const { getChatroom, addMessage } = useChatStore();
    const chatroom = getChatroom(chatroomId);
    const [messages, setMessages] = useState(chatroom?.messages || []);
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const initialRenderRef = useRef<boolean>(false);

    // Simulate loading and initial fetch
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setMessages(chatroom?.messages || []);
            setIsLoading(false);
        }, 1000);
    }, [chatroomId, chatroom?.messages]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!initialRenderRef.current && homeInput?.trim()) {
            handleSendMessage(homeInput);
            initialRenderRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [homeInput, initialRenderRef])

    // Reverse infinite scroll
    const handleScroll = () => {
        if (chatContainerRef.current?.scrollTop === 0) {
            console.log("Reached top, fetch older messages.");
        }
    };

    const handleSendMessage = (content: string, image?: string) => {
        const newMessage: MessageType = {
            id: Date.now().toString(),
            content,
            sender: 'user',
            timestamp: new Date(), image
        };
        addMessage(chatroomId, newMessage);
        setMessages(prev => [...prev, newMessage]);
        setIsTyping(true);

        // Simulate AI response with throttling
        setTimeout(() => {
            const aiResponse: MessageType = {
                id: Date.now().toString() + 'ai',
                content: `Gemini's response to - \n${content}\n${content}\n${content}`,
                sender: 'ai',
                timestamp: new Date()
            };
            addMessage(chatroomId, aiResponse);
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 3000 + Math.random() * 1000);
    };

    return (
        <div className="max-w-5xl w-full mx-auto h-full flex flex-col">
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 p-4 pt-0 overflow-y-auto"
                style={{ scrollbarWidth: 'none' }}
            >
                {messages.map(msg => (
                    <Message key={msg.id} message={msg} />
                ))}
                {isTyping &&
                    <div className="flex items-center gap-2 pl-14">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="w-6 h-6"
                        >
                            <Image
                                src="/gemini-avatar.png"
                                alt="Gemini thinking"
                                width={24}
                                height={24}
                            />
                        </motion.div>
                        <div className="space-y-2">
                            <p className='text-sm'>Show Thinking...</p>
                            <Skeleton className="h-2 w-[200px]" />
                            <Skeleton className="h-2 w-[180px]" />
                        </div>
                    </div>
                }
                <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-4 pb-0">
                <ChatInput onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
}