"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/core/sidebar";
import { SidebarProvider } from "@/context/sidebar-context";
import { useAuthStore } from "@/store/auth";
import Header from "@/components/core/header";


export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, loading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, loading, router]);

    if (loading || !isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
                <Sidebar />
                <main className="flex-1 flex flex-col">
                    <Header />
                    <div className="flex-1 overflow-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}