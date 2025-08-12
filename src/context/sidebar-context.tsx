"use client";
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

type SidebarContextType = {
    isOpen: boolean;
    toggleSidebar: () => void;
    openSidebar: () => void;
    closeSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = useCallback(() => setIsOpen(prev => !prev), []);
    const openSidebar = useCallback(() => setIsOpen(true), []);
    const closeSidebar = useCallback(() => setIsOpen(false), []);

    const value = useMemo(() => ({
        isOpen,
        toggleSidebar,
        openSidebar,
        closeSidebar
    }), [isOpen, toggleSidebar, openSidebar, closeSidebar]);

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}