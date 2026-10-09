import { useState, type ReactNode } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white text-[#111111]">
            <Sidebar
                mobileOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />

            <div className="lg:pl-64">
                <Navbar onMenuClick={() => setMobileOpen(true)} />

                <main className="p-4 sm:p-6 lg:p-8 bg-white">{children}</main>
            </div>
        </div>
    );
}