import {
    DollarSign,
    TrendingUp,
    Percent,
    Package,
    Users,
    Award,
    Star,
    Calendar,
    Briefcase,
    Clock,
    Database,
    Layers,
    BarChart2,
    ShoppingCart,
    CreditCard,
} from "lucide-react";
import type { ReportMetric } from "../../services/api";

interface ReportMetricsProps {
    metrics: ReportMetric[];
}

export default function ReportMetrics({ metrics }: ReportMetricsProps) {
    const getMetricIcon = (iconName?: string) => {
        const props = { size: 15, className: "text-[#111111]" };
        switch (iconName) {
            case "dollar":
                return <DollarSign {...props} />;
            case "trending-up":
                return <TrendingUp {...props} />;
            case "percent":
                return <Percent {...props} />;
            case "package":
                return <Package {...props} />;
            case "shopping-cart":
                return <ShoppingCart {...props} />;
            case "users":
                return <Users {...props} />;
            case "award":
                return <Award {...props} />;
            case "star":
                return <Star {...props} />;
            case "calendar":
                return <Calendar {...props} />;
            case "credit-card":
                return <CreditCard {...props} />;
            case "briefcase":
                return <Briefcase {...props} />;
            case "clock":
                return <Clock {...props} />;
            case "database":
                return <Database {...props} />;
            case "layers":
                return <Layers {...props} />;
            default:
                return <BarChart2 {...props} />;
        }
    };

    if (!metrics || metrics.length === 0) {
        return null;
    }

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                    Key Metrics
                </h2>
                <span className="text-xs text-[#666666]">
                    Domain indicators
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => (
                    <div
                        key={metric.id}
                        className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-4"
                    >
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-medium text-[#666666]">
                                {metric.label}
                            </span>
                            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7]">
                                {getMetricIcon(metric.icon)}
                            </div>
                        </div>

                        <div className="mt-3">
                            <h3 className="text-2xl font-bold tracking-tight text-[#111111]">
                                {metric.formatted}
                            </h3>
                            <p className="mt-1 text-xs text-[#666666] line-clamp-1">
                                {metric.subtitle}
                            </p>
                        </div>

                        {metric.badge && (
                            <div className="mt-3 border-t border-[#E5E5E5] pt-2">
                                <span className="inline-block rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-medium text-[#111111]">
                                    {metric.badge}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
