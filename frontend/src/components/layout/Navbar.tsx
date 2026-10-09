import { Bell, Menu, Upload, UserCircle } from "lucide-react";
import { useDataset } from "../../context/DatasetContext";

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const { setUploadModalOpen } = useDataset();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E5E5E5] bg-[#FFFFFF] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="rounded-md p-1.5 text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111] lg:hidden"
                >
                    <Menu size={20} />
                </button>

                <div>
                    <h2 className="text-sm font-semibold text-[#111111] sm:text-base">
                        Business Overview
                    </h2>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={() => setUploadModalOpen(true)}
                    className="flex items-center gap-2 rounded-md border border-[#E5E5E5] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-medium text-[#111111] transition hover:bg-[#F7F7F7]"
                >
                    <Upload size={14} className="text-[#111111]" />
                    <span>Upload Data</span>
                </button>

                <button
                    type="button"
                    aria-label="Notifications"
                    className="rounded-md p-2 text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]"
                >
                    <Bell size={17} />
                </button>

                <button
                    type="button"
                    aria-label="Account"
                    className="rounded-md p-1.5 text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]"
                >
                    <UserCircle size={22} />
                </button>
            </div>
        </header>
    );
}