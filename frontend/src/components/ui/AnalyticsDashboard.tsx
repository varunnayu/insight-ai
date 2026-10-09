import {
    BarChart3,
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Package,
    Tag,
    Boxes,
    Layers,
    Award,
    Users,
    Briefcase,
    GraduationCap,
    Clock,
    Database,
} from "lucide-react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import { useNavigate } from "react-router-dom";
import type { AnalyticsData } from "../../services/api";

interface AnalyticsDashboardProps {
    analytics: AnalyticsData;
}

// Professional, restrained chart palette
const CHART_PALETTE = ["#2563eb", "#0d9488", "#16a34a", "#ea580c", "#0284c7", "#475569"];

const formatCurrency = (value: number, symbol = "₹") => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: symbol === "₹" ? "INR" : "USD",
        maximumFractionDigits: 0,
    }).format(value);
};

const formatCompact = (value: number, symbol = "") => {
    if (Math.abs(value) >= 1_000_000) {
        return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
        return `${symbol}${(value / 1_000).toFixed(1)}k`;
    }
    return `${symbol}${value.toLocaleString()}`;
};

export default function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
    const navigate = useNavigate();
    const isSalesDataset = analytics.dataset?.type === "Sales";
    const currencySymbol = analytics.dataset?.currency_symbol || "₹";

    // -----------------------------------------------------------------
    // 1. SALES SPECIFIC VIEW
    // -----------------------------------------------------------------
    if (isSalesDataset) {
        const legacyKpis = analytics.legacy_kpis || {
            total_revenue: 0,
            total_profit: 0,
            total_orders: 0,
            total_quantity: 0,
            average_order_value: 0,
            profit_margin: 0,
        };

        const salesStats = [
            {
                title: "Total Revenue",
                value: formatCompact(legacyKpis.total_revenue, currencySymbol),
                icon: DollarSign,
                action: () => navigate("/analytics"),
                hint: "Inspect detailed breakdown",
            },
            {
                title: "Total Profit",
                value: formatCompact(legacyKpis.total_profit, currencySymbol),
                icon: TrendingUp,
                action: () => navigate("/analytics"),
                hint: "Inspect profitability metrics",
            },
            {
                title: "Total Orders",
                value: legacyKpis.total_orders.toLocaleString("en-IN"),
                icon: ShoppingCart,
                action: () => {
                    const el = document.getElementById("raw-data-preview");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                },
                hint: "View transaction records",
            },
            {
                title: "Profit Margin",
                value: `${legacyKpis.profit_margin.toFixed(1)}%`,
                icon: BarChart3,
                action: () => navigate("/reports"),
                hint: "View comprehensive report",
            },
        ];

        return (
            <div className="space-y-6">
                {/* Sales KPI Cards */}
                <div>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#666666]">
                        Sales Performance Indicators
                    </h3>
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {salesStats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <button
                                    key={stat.title}
                                    type="button"
                                    onClick={stat.action}
                                    className="group text-left rounded-md border border-[#E5E5E5] bg-white p-4 transition hover:border-[#111111] hover:bg-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-[#666666] group-hover:text-[#111111]">
                                            {stat.title}
                                        </span>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111] group-hover:border-[#111111]">
                                            <Icon size={14} />
                                        </div>
                                    </div>
                                    <h4 className="mt-3 text-2xl font-bold tracking-tight text-[#111111]">
                                        {stat.value}
                                    </h4>
                                    <p className="mt-2 text-[11px] text-[#666666] group-hover:text-[#111111]">
                                        {stat.hint} &rarr;
                                    </p>
                                </button>
                            );
                        })}
                    </section>
                </div>

                {/* Secondary Sales Metrics */}
                <section className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-md border border-[#E5E5E5] bg-white p-4">
                        <span className="text-xs font-medium text-[#666666]">Average Order Value</span>
                        <p className="mt-2 text-2xl font-bold text-[#111111]">
                            {formatCurrency(legacyKpis.average_order_value, currencySymbol)}
                        </p>
                        <p className="mt-1 text-[11px] text-[#999999]">Average revenue per confirmed invoice</p>
                    </div>

                    <div className="rounded-md border border-[#E5E5E5] bg-white p-4">
                        <span className="text-xs font-medium text-[#666666]">Total Quantity Sold</span>
                        <p className="mt-2 text-2xl font-bold text-[#111111]">
                            {legacyKpis.total_quantity.toLocaleString("en-IN")} units
                        </p>
                        <p className="mt-1 text-[11px] text-[#999999]">Aggregate unit volume delivered</p>
                    </div>
                </section>

                {/* Visualizations with Restrained Palette */}
                <div className="space-y-6">
                    {/* Revenue Trend Chart */}
                    {analytics.revenue_trend && analytics.revenue_trend.length > 0 && (
                        <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold text-[#111111]">Revenue Trajectory</h4>
                                    <p className="text-xs text-[#666666]">Monthly chronological performance (Primary Series)</p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#111111]">
                                    <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                                    Revenue ({currencySymbol})
                                </span>
                            </div>

                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics.revenue_trend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#666666" }} />
                                        <YAxis tick={{ fontSize: 11, fill: "#666666" }} tickFormatter={(v) => formatCompact(v, currencySymbol)} />
                                        <Tooltip
                                            formatter={(v) => [formatCurrency(Number(v), currencySymbol), "Revenue"]}
                                            labelFormatter={(l) => `Date: ${l}`}
                                            contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E5", borderRadius: "6px", color: "#111111" }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#2563eb"
                                            strokeWidth={2.5}
                                            dot={{ r: 3.5, fill: "#2563eb", stroke: "#FFFFFF", strokeWidth: 1.5 }}
                                            activeDot={{ r: 5.5, fill: "#2563eb" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    )}

                    {/* Category & Region */}
                    <section className="grid gap-6 lg:grid-cols-2">
                        {analytics.revenue_by_category && analytics.revenue_by_category.length > 0 && (
                            <div className="rounded-md border border-[#E5E5E5] bg-white p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-[#111111]">Revenue by Category</h4>
                                        <p className="text-xs text-[#666666]">Ranked category breakdown (Primary Series)</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#111111]">
                                        <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                                        Category
                                    </span>
                                </div>
                                <div className="h-[260px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.revenue_by_category}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                            <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#666666" }} />
                                            <YAxis tick={{ fontSize: 11, fill: "#666666" }} tickFormatter={(v) => formatCompact(v, currencySymbol)} />
                                            <Tooltip
                                                formatter={(v) => [formatCurrency(Number(v), currencySymbol), "Revenue"]}
                                                labelFormatter={(l) => `Category: ${l}`}
                                                contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E5", borderRadius: "6px", color: "#111111" }}
                                            />
                                            <Bar dataKey="revenue" fill="#2563eb" radius={[3, 3, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {analytics.revenue_by_region && analytics.revenue_by_region.length > 0 && (
                            <div className="rounded-md border border-[#E5E5E5] bg-white p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-[#111111]">Revenue by Region</h4>
                                        <p className="text-xs text-[#666666]">Geographic sales distribution (Secondary Series)</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#111111]">
                                        <span className="h-2 w-2 rounded-full bg-[#0d9488]" />
                                        Region
                                    </span>
                                </div>
                                <div className="h-[260px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.revenue_by_region}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                            <XAxis dataKey="region" tick={{ fontSize: 11, fill: "#666666" }} />
                                            <YAxis tick={{ fontSize: 11, fill: "#666666" }} tickFormatter={(v) => formatCompact(v, currencySymbol)} />
                                            <Tooltip
                                                formatter={(v) => [formatCurrency(Number(v), currencySymbol), "Revenue"]}
                                                labelFormatter={(l) => `Region: ${l}`}
                                                contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E5", borderRadius: "6px", color: "#111111" }}
                                            />
                                            <Bar dataKey="revenue" fill="#0d9488" radius={[3, 3, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        );
    }

    // -----------------------------------------------------------------
    // 2. UNIVERSAL / DATASET-ADAPTIVE VIEW
    // -----------------------------------------------------------------
    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case "Package": return <Package size={15} />;
            case "Tag": return <Tag size={15} />;
            case "Boxes": return <Boxes size={15} />;
            case "Layers": return <Layers size={15} />;
            case "Award": return <Award size={15} />;
            case "Users": return <Users size={15} />;
            case "Briefcase": return <Briefcase size={15} />;
            case "GraduationCap": return <GraduationCap size={15} />;
            case "Clock": return <Clock size={15} />;
            case "DollarSign": return <DollarSign size={15} />;
            case "TrendingUp": return <TrendingUp size={15} />;
            default: return <Database size={15} />;
        }
    };

    const kpisList = analytics.kpis || [];
    const charts = analytics.charts;

    const handleKPIClick = (kpiId: string) => {
        if (kpiId.toLowerCase().includes("product") || kpiId.toLowerCase().includes("category")) {
            navigate("/analytics");
        } else if (kpiId.toLowerCase().includes("total") || kpiId.toLowerCase().includes("row")) {
            const el = document.getElementById("raw-data-preview");
            if (el) el.scrollIntoView({ behavior: "smooth" });
        } else {
            navigate("/analytics");
        }
    };

    return (
        <div className="space-y-6">
            {/* Section E: Adaptive Domain KPI Cards */}
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                        Key Domain Metrics
                    </h3>
                    <span className="text-[11px] text-[#999999]">
                        Click metric to view detailed breakdown
                    </span>
                </div>
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {kpisList.map((kpi) => (
                        <button
                            key={kpi.id}
                            type="button"
                            onClick={() => handleKPIClick(kpi.id)}
                            className="group text-left flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-4 transition hover:border-[#111111] hover:bg-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111] group-hover:border-[#111111]">
                                        {renderIcon(kpi.icon)}
                                    </div>
                                    {kpi.trend && (
                                        <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-medium text-[#111111]">
                                            {kpi.trend}
                                        </span>
                                    )}
                                </div>

                                <p className="mt-3 text-xs font-medium text-[#666666] group-hover:text-[#111111]">{kpi.title}</p>
                                <h4 className="mt-1 text-2xl font-bold tracking-tight text-[#111111]">
                                    {kpi.prefix}{kpi.value}{kpi.suffix}
                                </h4>
                            </div>

                            {kpi.subtext ? (
                                <p className="mt-2.5 border-t border-[#E5E5E5] pt-2 text-[11px] text-[#666666]">
                                    {kpi.subtext}
                                </p>
                            ) : (
                                <p className="mt-2.5 border-t border-[#E5E5E5] pt-2 text-[11px] text-[#999999] group-hover:text-[#111111]">
                                    View breakdown &rarr;
                                </p>
                            )}
                        </button>
                    ))}
                </section>
            </div>

            {/* Section F: Visualizations with Restrained Palette */}
            <section className="grid gap-6 lg:grid-cols-2">
                {/* Primary Category Bar Chart */}
                {charts?.primary_bar_chart?.available && charts.primary_bar_chart.data && (
                    <div className="rounded-md border border-[#E5E5E5] bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-[#111111]">
                                    {charts.primary_bar_chart.title}
                                </h4>
                                <p className="text-xs text-[#666666]">
                                    Top ranked categories by {charts.primary_bar_chart.metric} (Primary Series)
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#111111]">
                                <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                                Category
                            </span>
                        </div>

                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.primary_bar_chart.data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                    <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#666666" }} interval={0} angle={-20} textAnchor="end" height={45} />
                                    <YAxis tick={{ fontSize: 11, fill: "#666666" }} tickFormatter={(v) => formatCompact(Number(v))} />
                                    <Tooltip
                                        formatter={(v) => [Number(v).toLocaleString(), charts.primary_bar_chart.metric || "Value"]}
                                        labelFormatter={(l) => `Category: ${l}`}
                                        contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E5", borderRadius: "6px", color: "#111111" }}
                                    />
                                    <Bar dataKey="sum" fill="#2563eb" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Donut or Distribution Histogram */}
                {charts?.segment_donut_chart?.available && charts.segment_donut_chart.data ? (
                    <div className="rounded-md border border-[#E5E5E5] bg-white p-5">
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-[#111111]">
                                {charts.segment_donut_chart.title}
                            </h4>
                            <p className="text-xs text-[#666666]">
                                Segment volume distribution
                            </p>
                        </div>

                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts.segment_donut_chart.data}
                                        innerRadius={55}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {charts.segment_donut_chart.data.map((_, idx) => (
                                            <Cell key={`cell-${idx}`} fill={CHART_PALETTE[idx % CHART_PALETTE.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(v: unknown, n: unknown) => [`${Number(v).toLocaleString()} records`, String(n)]}
                                        contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E5", borderRadius: "6px", color: "#111111" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : charts?.distribution_chart?.available && charts.distribution_chart.bins ? (
                    <div className="rounded-md border border-[#E5E5E5] bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-[#111111]">
                                    {charts.distribution_chart.title}
                                </h4>
                                <p className="text-xs text-[#666666]">Frequency distribution histogram (Secondary Series)</p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#111111]">
                                <span className="h-2 w-2 rounded-full bg-[#0d9488]" />
                                Frequency
                            </span>
                        </div>

                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.distribution_chart.bins}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#666666" }} interval={0} angle={-20} textAnchor="end" height={45} />
                                    <YAxis tick={{ fontSize: 11, fill: "#666666" }} />
                                    <Tooltip
                                        formatter={(v) => [`${Number(v).toLocaleString()} rows`, "Count"]}
                                        labelFormatter={(l) => `Range: ${l}`}
                                        contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E5", borderRadius: "6px", color: "#111111" }}
                                    />
                                    <Bar dataKey="count" fill="#0d9488" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : null}
            </section>
        </div>
    );
}