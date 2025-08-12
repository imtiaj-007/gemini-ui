'use client'

import React from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils"


export type ComboBoxOption = {
    label: React.ReactNode;
    value: string;
    name?: string;
    [key: string]: unknown;
};

type ComboBoxProps = {
    value: string;
    onChange: (value: string, option?: ComboBoxOption) => void;
    options: ComboBoxOption[];
    placeholder?: string;
    width?: string | number;
    disabled?: boolean;
    inputPlaceholder?: string;
    noOptionsText?: string;
    className?: string;
};

export function ComboBox({
    value,
    onChange,
    options,
    placeholder = "Select...",
    width = "200px",
    disabled = false,
    inputPlaceholder = "Search...",
    noOptionsText = "No options found.",
    className = "",
}: ComboBoxProps) {
    const [open, setOpen] = React.useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(`justify-between`, className)}
                    style={{ width }}
                    disabled={disabled}
                    type="button"
                >
                    {selectedOption ? selectedOption.label : placeholder}
                    <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width }}>
                <Command
                    filter={(value, search) => {
                        const option = options.find(opt => opt.value === value);
                        if (!option) return 0;
                        if (!search) return 1;
                        // Case-insensitive search in name
                        if (option.name && typeof option.name === "string") {
                            return option.name.toLowerCase().includes((search ?? "").toLowerCase()) ? 1 : 0;
                        }
                        return 0;
                    }}
                >
                    <CommandInput placeholder={inputPlaceholder} className="h-9" />
                    <CommandList style={{ scrollbarWidth: 'none' }}>
                        <CommandEmpty>{noOptionsText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => {
                                        onChange(option.value, option);
                                        setOpen(false);
                                    }}
                                >
                                    {option.label}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}