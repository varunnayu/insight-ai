import { useState } from "react";
import {
    ResponsiveContainer,
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
    Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { ReportChart } from "../../services/api";

interface ReportChartsProps {
    charts: ReportChart[];
}

const CHART_PALETTE = [
    "#2563eb",
    "#0d9488",
    "#16a34a",
    "#ea580c",
    "#0284c7",
    "#475569",
];

export default function ReportCharts({ charts }: ReportChartsProps) {
    const [activeTab, setActiveTab] = useState(0);

    if (!charts || charts.length === 0) {
        return null;
    }

    const renderChart = (chart: ReportChart) => {
        if (!chart.data || chart.data.length === 0) {
            return (
                <div className="flex h-64 items-center justify-center text-xs text-[#999999]">
                    Insufficient data points to render visualization.
                </div>
            );
        }

        switch (chart.type) {
            case "line":
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chart.data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
                            <XAxis
                                dataKey={chart.x_key}
                                stroke="#666666"
                                fontSize={11}
                                tickLine={false}
                                dy={8}
                            />
                            <YAxis
                                stroke="#666666"
                                fontSize={11}
                                tickLine={false}
                                dx={-8}
                                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: "6px",
                                    color: "#111111",
                                    fontSize: "12px",
                                    borderColor: "#E5E5E5",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey={chart.y_key}
                                stroke="#2563eb"
                                strokeWidth={2.5}
                                dot={{ fill: "#2563eb", r: 3.5, stroke: "#FFFFFF", strokeWidth: 1.5 }}
                                activeDot={{ r: 5.5, fill: "#2563eb" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case "bar":
            case "histogram":
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chart.data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
                            <XAxis
                                dataKey={chart.x_key}
                                stroke="#666666"
                                fontSize={11}
                                tickLine={false}
                                dy={8}
                            />
                            <YAxis
                                stroke="#666666"
                                fontSize={11}
                                tickLine={false}
                                dx={-8}
                                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: "6px",
                                    color: "#111111",
                                    fontSize: "12px",
                                    borderColor: "#E5E5E5",
                                }}
                            />
                            <Bar
                                dataKey={chart.y_key}
                                fill="#2563eb"
                                radius={[3, 3, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case "pie":
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: "6px",
                                    color: "#111111",
                                    fontSize: "12px",
                                    borderColor: "#E5E5E5",
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: "11px", color: "#666666" }}
                            />
                            <Pie
                                data={chart.data}
                                dataKey={chart.y_key}
                                nameKey={chart.x_key}
                                cx="50%"
                                cy="45%"
                                innerRadius={50}
                                outerRadius={90}
                                paddingAngle={2}
                            >
                                {chart.data.map((_, idx) => (
                                    <Cell
                                        key={`cell-${idx}`}
                                        fill={CHART_PALETTE[idx % CHART_PALETTE.length]}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                );

            case "scatter":
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                            <XAxis
                                type="number"
                                dataKey="x"
                                name={chart.x_label || "X"}
                                stroke="#666666"
                                fontSize={11}
                                tickLine={false}
                                dy={8}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                name={chart.y_label || "Y"}
                                stroke="#666666"
                                fontSize={11}
                                tickLine={false}
                                dx={-8}
                            />
                            <Tooltip
                                cursor={{ strokeDasharray: "3 3" }}
                                contentStyle={{
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: "6px",
                                    color: "#111111",
                                    fontSize: "12px",
                                    borderColor: "#E5E5E5",
                                }}
                            />
                            <Scatter name={chart.title} data={chart.data} fill="#2563eb" />
                        </ScatterChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    const currentChart = charts[activeTab] || charts[0];

    return (
        <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <BarChart3 size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Visual Analysis
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Visual charts for detected dataset distributions
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex flex-wrap gap-1 rounded-md border border-[#E5E5E5] bg-[#F7F7F7] p-0.5">
                    {charts.map((chart, idx) => (
                        <button
                            key={chart.id}
                            onClick={() => setActiveTab(idx)}
                            className={`rounded px-2.5 py-1 text-xs transition ${
                                activeTab === idx
                                    ? "bg-white text-[#111111] font-semibold shadow-sm"
                                    : "text-[#666666] hover:text-[#111111]"
                            }`}
                        >
                            {chart.title.split(":")[0].slice(0, 16)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Chart Container */}
            <div className="mt-4">
                <div className="mb-3">
                    <h3 className="text-xs font-semibold text-[#111111]">
                        {currentChart.title}
                    </h3>
                    <p className="text-[11px] text-[#666666]">
                        {currentChart.description}
                    </p>
                </div>

                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    {renderChart(currentChart)}
                </div>
            </div>
        </section>
    );
}
