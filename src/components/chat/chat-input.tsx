"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Paperclip, Mic, SendHorizonal, Plus, BookOpenText, ImagesIcon, Lightbulb, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';


interface ChatInputProps {
    onSendMessage: (content: string, image?: string) => void;
    isGenerating?: boolean;
}

export default function ChatInput({ onSendMessage, isGenerating }: ChatInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("File input changed", e.target.files);
        const file = e.target.files?.[0];
        console.log("Selected file:", file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log("File read complete:", reader.result);
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((inputValue.trim() || imagePreview) && !isGenerating) {
            onSendMessage(inputValue, imagePreview || undefined);
            setInputValue('');
            setImagePreview(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="relative w-full max-w-3xl mx-auto px-4 pb-4">
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />
            {imagePreview && (
                <Card className="absolute -top-30 mb-2 w-fit p-2">
                    <div className="relative w-fit">
                        <Image
                            src={imagePreview}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="h-24 w-24 object-cover rounded-md"
                        />
                        <button
                            onClick={() => setImagePreview(null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                            <X className='size-3' />
                        </button>
                    </div>
                </Card>
            )}
            <form onSubmit={handleSubmit} className="relative">
                <div className="absolute left-2 bottom-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Plus className='w-4 h-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='start' side='top'>
                            <DropdownMenuItem
                                onClick={() => { fileInputRef.current?.click() }}
                            >
                                <Paperclip /> Attach Image
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem><BookOpenText /> Study & Learn</DropdownMenuItem>
                            <DropdownMenuItem><ImagesIcon /> Create Image</DropdownMenuItem>
                            <DropdownMenuItem><Lightbulb /> Deep Research</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Textarea
                    placeholder="Message Pixel Pilot..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[50px] w-full resize-none pl-12 pr-16 py-4 rounded-full"
                    rows={1}
                />
                <div className="absolute right-2 bottom-2 flex space-x-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Mic className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-700"
                        disabled={!inputValue.trim()}
                        aria-label="Send message"
                        aria-disabled={!inputValue.trim()}
                    >
                        <SendHorizonal className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
};