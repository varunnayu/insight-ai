import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity } from "lucide-react";

import type { UniversalCharts } from "../../services/api";

interface AutomaticChartsProps {
    charts: UniversalCharts;
    currencySymbol?: string;
}

// Restrained professional palette: blue primary, teal secondary, green, orange, sky, slate
const CHART_PALETTE = ["#2563eb", "#0d9488", "#16a34a", "#ea580c", "#0284c7", "#475569"];

const formatCompact = (val: number, symbol = "") => {
    if (Math.abs(val) >= 1_000_000) {
        return `${symbol}${(val / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(val) >= 1_000) {
        return `${symbol}${(val / 1_000).toFixed(1)}k`;
    }
    return `${symbol}${val.toFixed(0)}`;
};

export default function AutomaticCharts({ charts, currencySymbol = "$" }: AutomaticChartsProps) {
    const { trend_chart, primary_bar_chart, secondary_bar_chart, segment_donut_chart, scatter_chart } = charts;

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-[#111111]">
                        Automated Visualizations
                    </h2>
                    <p className="text-xs text-[#666666]">
                        Statistical visual representations with professional restrained palettes
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* 1. Time-series Trend Line Chart */}
                <div className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                <TrendingUp size={14} />
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-[#111111]">
                                    {trend_chart?.title || "Temporal Trend"}
                                </h3>
                                <p className="text-[11px] text-[#666666]">
                                    {trend_chart?.available
                                        ? `Timeline across ${trend_chart.x_axis}`
                                        : "Series progression"}
                                </p>
                            </div>
                        </div>
                        {trend_chart?.available && (
                            <span className="inline-flex items-center gap-1.5 rounded border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#111111]">
                                <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                                Primary Series
                            </span>
                        )}
                    </div>

                    <div className="h-[260px] w-full">
                        {trend_chart?.available && trend_chart.data && trend_chart.data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend_chart.data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#666666" }} />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "#666666" }}
                                        tickFormatter={(v) => formatCompact(Number(v), currencySymbol)}
                                    />
                                    <Tooltip
                                        formatter={(val: unknown) => [
                                            `${currencySymbol}${Number(val).toLocaleString()}`,
                                            trend_chart.y_axis || "Value",
                                        ]}
                                        labelFormatter={(l) => `Date: ${l}`}
                                        contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E5", borderRadius: "6px", color: "#111111" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#2563eb"
                                        strokeWidth={2.5}
                                        dot={{ r: 3.5, fill: "#2563eb", stroke: "#FFFFFF", strokeWidth: 1.5 }}
                                        activeDot={{ r: 5.5, fill: "#2563eb" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed border-[#E5E5E5] p-6 text-center">
                                <TrendingUp size={20} className="text-[#999999]" />
                                <p className="mt-2 text-xs font-medium text-[#666666]">
                                    No temporal date column detected
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Primary Category Bar Chart */}
                <div className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                <BarChart3 size={14} />
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-[#111111]">
                                    {primary_bar_chart?.title || "Categorical Performance"}
                                </h3>
                                <p className="text-[11px] text-[#666666]">
                                    Cohorts ranked by {primary_bar_chart?.metric || "metric"}
                                </p>
                            </div>
                        </div>
                        {primary_bar_chart?.available && (
                            <span className="inline-flex items-center gap-1.5 rounded border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#111111]">
                                <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                                Category
                            </span>
                        )}
                    </div>

                    <div className="h-[260px] w-full">
                        {primary_bar_chart?.available && primary_bar_chart.data && primary_bar_chart.data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={primary_bar_chart.data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                    <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#666666" }} interval={0} angle={-20} textAnchor="end" height={45} />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "#666666" }}
                                        tickFormatter={(v) => formatCompact(Number(v))}
                                    />
                                    <Tooltip
                                        formatter={(val: unknown) => [
                                            Number(val).toLocaleString(),
                                            primary_bar_chart.metric || "Value",
                                        ]}
                                        labelFormatter={(l) => `Category: ${l}`}
                                        contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E5", borderRadius: "6px", color: "#111111" }}
                                    />
                                    <Bar
                                        dataKey="sum"
                                        fill="#2563eb"
                                        radius={[3, 3, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed border-[#E5E5E5] p-6 text-center">
                                <p className="text-xs text-[#999999]">Categorical analysis unavailable.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Segment Donut Chart */}
                {segment_donut_chart?.available && segment_donut_chart.data && segment_donut_chart.data.length > 0 && (
                    <div className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                    <PieIcon size={14} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-[#111111]">
                                        {segment_donut_chart.title}
                                    </h3>
                                    <p className="text-[11px] text-[#666666]">
                                        Volume proportion breakdown
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={segment_donut_chart.data}
                                        innerRadius={55}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {segment_donut_chart.data.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(val: unknown, name: unknown) => [
                                            `${Number(val).toLocaleString()} records`,
                                            String(name),
                                        ]}
                                        contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E5", borderRadius: "6px", color: "#111111" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* 4. Scatter Plot or Secondary Bar Chart */}
                {scatter_chart?.available && scatter_chart.data && scatter_chart.data.length > 0 ? (
                    <div className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                    <Activity size={14} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-[#111111]">
                                        {scatter_chart.title}
                                    </h3>
                                    <p className="text-[11px] text-[#666666]">
                                        {scatter_chart.x_axis} vs {scatter_chart.y_axis}
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#111111]">
                                <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                                Data Points
                            </span>
                        </div>

                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                                    <XAxis
                                        type="number"
                                        dataKey="x"
                                        name={scatter_chart.x_axis}
                                        tick={{ fontSize: 11, fill: "#666666" }}
                                        tickFormatter={(v) => formatCompact(Number(v))}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="y"
                                        name={scatter_chart.y_axis}
                                        tick={{ fontSize: 11, fill: "#666666" }}
                                        tickFormatter={(v) => formatCompact(Number(v))}
                                    />
                                    <Tooltip
                                        cursor={{ strokeDasharray: "3 3" }}
                                        contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E5", borderRadius: "6px", color: "#111111" }}
                                    />
                                    <Scatter
                                        name="Records"
                                        data={scatter_chart.data}
                                        fill="#2563eb"
                                    />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : secondary_bar_chart?.available && secondary_bar_chart.data ? (
                    <div className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                    <BarChart3 size={14} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-[#111111]">
                                        {secondary_bar_chart.title}
                                    </h3>
                                    <p className="text-[11px] text-[#666666]">
                                        Performance by {secondary_bar_chart.dimension} (Secondary Series)
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#111111]">
                                <span className="h-2 w-2 rounded-full bg-[#0d9488]" />
                                Secondary Series
                            </span>
                        </div>

                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={secondary_bar_chart.data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                    <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#666666" }} interval={0} angle={-20} textAnchor="end" height={45} />
                                    <YAxis tick={{ fontSize: 11, fill: "#666666" }} tickFormatter={(v) => formatCompact(Number(v))} />
                                    <Tooltip
                                        formatter={(val: unknown) => [
                                            Number(val).toLocaleString(),
                                            secondary_bar_chart.metric || "Value",
                                        ]}
                                        labelFormatter={(l) => `Category: ${l}`}
                                        contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E5", borderRadius: "6px", color: "#111111" }}
                                    />
                                    <Bar dataKey="sum" fill="#0d9488" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
