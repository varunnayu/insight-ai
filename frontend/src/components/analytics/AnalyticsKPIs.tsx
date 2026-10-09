import {
    Package,
    Tag,
    Boxes,
    Layers,
    Award,
    TrendingUp,
    DollarSign,
    Percent,
    ShoppingCart,
    Users,
    Briefcase,
    GraduationCap,
    Clock,
    Database,
    BookOpen,
} from "lucide-react";

import type { KPICard } from "../../services/api";

interface AnalyticsKPIsProps {
    kpis: KPICard[];
}

export default function AnalyticsKPIs({ kpis }: AnalyticsKPIsProps) {
    if (!kpis || kpis.length === 0) {
        return null;
    }

    const renderIcon = (iconName: string) => {
        const props = { size: 15, className: "text-[#111111]" };
        switch (iconName) {
            case "Package": return <Package {...props} />;
            case "Tag": return <Tag {...props} />;
            case "Boxes": return <Boxes {...props} />;
            case "Layers": return <Layers {...props} />;
            case "Award": return <Award {...props} />;
            case "TrendingUp": return <TrendingUp {...props} />;
            case "DollarSign": return <DollarSign {...props} />;
            case "Percent": return <Percent {...props} />;
            case "ShoppingCart": return <ShoppingCart {...props} />;
            case "Users": return <Users {...props} />;
            case "Briefcase": return <Briefcase {...props} />;
            case "GraduationCap": return <GraduationCap {...props} />;
            case "Clock": return <Clock {...props} />;
            case "BookOpen": return <BookOpen {...props} />;
            default: return <Database {...props} />;
        }
    };

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#111111]">
                    Key Performance Indicators
                </h2>
                <span className="text-xs text-[#666666]">
                    Supported metrics for active dataset
                </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.id}
                        className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-4"
                    >
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                    {renderIcon(kpi.icon)}
                                </div>

                                {kpi.trend && (
                                    <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-medium text-[#111111]">
                                        {kpi.trend}
                                    </span>
                                )}
                            </div>

                            <p className="mt-3 text-xs font-medium text-[#666666]">
                                {kpi.title}
                            </p>

                            <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#111111]">
                                {kpi.prefix}{kpi.value}{kpi.suffix}
                            </h3>
                        </div>

                        {kpi.subtext && (
                            <p className="mt-2.5 border-t border-[#E5E5E5] pt-2 text-[11px] text-[#666666]">
                                {kpi.subtext}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
