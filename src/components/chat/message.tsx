"use client";

import { Copy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from '@/lib/utils';


export type Sender = 'user' | 'ai';

export type MessageType = {
    id: string;
    content: string;
    sender: Sender;
    timestamp: Date;
    image?: string;
};

interface MessageProps {
    message: MessageType;
}

export default function Message({ message }: MessageProps) {
    const isUser = message.sender === 'user';

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        toast("Copied to clipboard!");
    };

    return (
        <div className={cn(
            "flex items-start gap-2.5 my-4 group",
            isUser && "flex-row-reverse"
        )}>
            <Avatar className="w-8 h-8">
                <AvatarImage src={isUser ? "https://github.com/shadcn.png" : "/gemini-avatar.png"} />
                <AvatarFallback>{isUser ? 'U' : 'G'}</AvatarFallback>
            </Avatar>
            <div className={cn(
                "flex flex-col w-full max-w-md leading-1.5 p-4 border-gray-200 relative",
                isUser
                    ? "bg-blue-500 text-white rounded-s-xl rounded-ee-xl"
                    : "bg-gray-200 dark:bg-gray-700 rounded-e-xl rounded-es-xl"
            )}>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-sm font-semibold">{isUser ? 'You' : 'Gemini'}</span>
                    <span className="text-sm font-normal opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                {message.image &&
                    <Image
                        src={message.image}
                        alt="Uploaded content"
                        width={800}
                        height={800}
                        className="rounded-lg my-2 max-h-80 object-contain"
                        priority={false}
                    />
                }
                <p className="text-sm font-normal py-2.5 whitespace-pre-wrap break-words">{message.content}</p>
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded"
                    aria-label="Copy message"
                >
                    <Copy className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}