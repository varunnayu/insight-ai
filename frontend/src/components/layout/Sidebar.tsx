import {
    BarChart3,
    Bot,
    BrainCircuit,
    FileText,
    History,
    LayoutDashboard,
    LineChart,
    Mail,
    Settings,
    TriangleAlert,
    X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import Logo from "../ui/Logo";
import { useDataset } from "../../context/DatasetContext";

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

const navigation = [
    {
        name: "Overview",
        path: "/dashboard",
        icon: LayoutDashboard,
        end: true,
    },
    {
        name: "Analytics",
        path: "/analytics",
        icon: BarChart3,
    },
    {
        name: "AI Insights",
        path: "/insights",
        icon: BrainCircuit,
    },
    {
        name: "AI Analyst",
        path: "/analyst",
        icon: Bot,
    },
    {
        name: "Forecast",
        path: "/forecast",
        icon: LineChart,
    },
    {
        name: "Anomalies",
        path: "/anomalies",
        icon: TriangleAlert,
    },
    {
        name: "Reports",
        path: "/reports",
        icon: FileText,
    },
    {
        name: "History",
        path: "/history",
        icon: History,
    },
];

export default function Sidebar({
    mobileOpen = false,
    onClose,
}: SidebarProps) {
    const { historyPanelOpen, setHistoryPanelOpen } = useDataset();

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r border-[#E5E5E5]
          bg-[#FFFFFF] transition-transform duration-200
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center justify-between border-b border-[#E5E5E5] px-5">
                        <NavLink to="/" onClick={onClose} className="flex items-center">
                            <Logo />
                        </NavLink>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md p-1.5 text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111] lg:hidden"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="px-3 py-4">
                        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#999999]">
                            Workspace
                        </p>

                        <nav className="space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;

                                if (item.name === "History") {
                                    return (
                                        <button
                                            key={item.name}
                                            type="button"
                                            onClick={() => {
                                                setHistoryPanelOpen(true);
                                                if (onClose) onClose();
                                            }}
                                            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition ${historyPanelOpen
                                                    ? "border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111] font-semibold"
                                                    : "border border-transparent text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]"
                                                }`}
                                        >
                                            <Icon size={16} className="shrink-0 text-[#111111]" />
                                            <span>{item.name}</span>
                                        </button>
                                    );
                                }

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.end}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition ${isActive
                                                ? "border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111] font-semibold"
                                                : "border border-transparent text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]"
                                            }`
                                        }
                                    >
                                        <Icon size={16} className="shrink-0 text-[#111111]" />
                                        <span>{item.name}</span>
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="mt-auto border-t border-[#E5E5E5] p-3 space-y-2">
                        <NavLink
                            to="/settings"
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition ${isActive
                                    ? "border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111] font-semibold"
                                    : "border border-transparent text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]"
                                }`
                            }
                        >
                            <Settings size={16} className="shrink-0 text-[#111111]" />
                            <span>Settings</span>
                        </NavLink>

                        {/* Permanent Uneditable Footer */}
                        <div
                            aria-readonly="true"
                            className="select-none rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-2.5 text-[11px]"
                        >
                            <p className="font-semibold text-[#111111]">
                                Made by Varun ❤️
                            </p>
                            <a
                                href="mailto:varunsantu2002@gmail.com"
                                className="mt-1 flex items-center gap-1.5 text-[10px] text-[#666666] transition hover:text-[#111111] hover:underline"
                                title="Contact by mail: varunsantu2002@gmail.com"
                            >
                                <Mail size={11} className="shrink-0 text-[#999999]" />
                                <span className="truncate">varunsantu2002@gmail.com</span>
                            </a>
                            <p className="mt-1.5 border-t border-[#E5E5E5] pt-1.5 text-[10px] text-[#999999]">
                                © {new Date().getFullYear()} Varun. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}