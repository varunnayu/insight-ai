import { BarChart3 } from "lucide-react";

interface LogoProps {
    collapsed?: boolean;
}

export default function Logo({ collapsed = false }: LogoProps) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#111111] text-white">
                <BarChart3 size={17} />
            </div>

            {!collapsed && (
                <div>
                    <h1 className="text-sm font-semibold tracking-tight text-[#111111]">
                        InsightAI
                    </h1>

                    <p className="text-[10px] font-medium text-[#666666]">
                        Business Intelligence
                    </p>
                </div>
            )}
        </div>
    );
}