"use client"

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/context/sidebar-context";


export default function Header() {
    const { toggleSidebar } = useSidebar();

    return (
        <header className="flex justify-between md:justify-end p-4">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="md:hidden"
                        onClick={() => toggleSidebar()}
                    >
                        <Menu className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Toggle Sidebar</p>
                </TooltipContent>
            </Tooltip>
            <ThemeToggle />
        </header>
    )
}