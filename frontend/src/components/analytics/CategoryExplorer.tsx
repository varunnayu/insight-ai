import { useState, useEffect } from "react";
import { Layers } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { fetchCategoryPerformance, type CategoryPerformanceRow } from "../../services/api";

interface CategoryExplorerProps {
    dimensions: string[];
    metrics: string[];
    initialData?: CategoryPerformanceRow[];
    initialDim?: string;
    initialMetric?: string;
}

export default function CategoryExplorer({
    dimensions,
    metrics,
    initialData = [],
    initialDim,
    initialMetric,
}: CategoryExplorerProps) {
    const [selectedDim, setSelectedDim] = useState<string>(initialDim || dimensions[0] || "");
    const [selectedMetric, setSelectedMetric] = useState<string>(initialMetric || metrics[0] || "");
    const [aggMode, setAggMode] = useState<"sum" | "mean" | "count">("sum");
    const [data, setData] = useState<CategoryPerformanceRow[]>(initialData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dimensions.length > 0 && !selectedDim) {
            setSelectedDim(dimensions[0]);
        }
    }, [dimensions, selectedDim]);

    useEffect(() => {
        if (metrics.length > 0 && !selectedMetric) {
            setSelectedMetric(metrics[0]);
        }
    }, [metrics, selectedMetric]);

    useEffect(() => {
        if (selectedDim && selectedMetric) {
            let isCurrent = true;
            setLoading(true);
            fetchCategoryPerformance(selectedDim, selectedMetric)
                .then((res) => {
                    if (isCurrent && res.success) {
                        setData(res.data);
                    }
                })
                .catch(() => {
                    // Ignore error
                })
                .finally(() => {
                    if (isCurrent) setLoading(false);
                });

            return () => {
                isCurrent = false;
            };
        }
    }, [selectedDim, selectedMetric]);

    if (dimensions.length === 0) {
        return null;
    }

    const totalAgg = data.reduce((acc, curr) => acc + (aggMode === "count" ? curr.count : curr[aggMode]), 0);

    return (
        <section className="space-y-4 rounded-md border border-[#E5E5E5] bg-white p-5">
            {/* Header with Dimension & Metric Selectors */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <Layers size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Category & Segment Explorer
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Cross-analyze categorical dimensions against numeric metrics
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Dimension Selector */}
                    <select
                        value={selectedDim}
                        onChange={(e) => setSelectedDim(e.target.value)}
                        className="rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1.5 text-xs text-[#111111] focus:outline-none"
                    >
                        {dimensions.map((dim) => (
                            <option key={dim} value={dim}>
                                Dimension: {dim}
                            </option>
                        ))}
                    </select>

                    {/* Metric Selector (if metrics exist) */}
                    {metrics.length > 0 && (
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            className="rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1.5 text-xs text-[#111111] focus:outline-none"
                        >
                            {metrics.map((met) => (
                                <option key={met} value={met}>
                                    Metric: {met}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Aggregation Mode */}
                    <div className="inline-flex rounded-md border border-[#E5E5E5] bg-[#F7F7F7] p-0.5 text-xs">
                        <button
                            type="button"
                            onClick={() => setAggMode("sum")}
                            className={`rounded px-2 py-1 text-xs transition ${
                                aggMode === "sum"
                                    ? "bg-white text-[#111111] font-semibold shadow-sm"
                                    : "text-[#666666] hover:text-[#111111]"
                            }`}
                        >
                            Sum
                        </button>
                        <button
                            type="button"
                            onClick={() => setAggMode("mean")}
                            className={`rounded px-2 py-1 text-xs transition ${
                                aggMode === "mean"
                                    ? "bg-white text-[#111111] font-semibold shadow-sm"
                                    : "text-[#666666] hover:text-[#111111]"
                            }`}
                        >
                            Avg
                        </button>
                        <button
                            type="button"
                            onClick={() => setAggMode("count")}
                            className={`rounded px-2 py-1 text-xs transition ${
                                aggMode === "count"
                                    ? "bg-white text-[#111111] font-semibold shadow-sm"
                                    : "text-[#666666] hover:text-[#111111]"
                            }`}
                        >
                            Count
                        </button>
                    </div>
                </div>
            </div>

            {/* Chart + Table Grid */}
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Left: Interactive Bar Chart (7 cols) */}
                <div className="h-[280px] lg:col-span-7">
                    {loading ? (
                        <div className="flex h-full items-center justify-center rounded-md bg-[#F7F7F7]">
                            <p className="text-xs text-[#666666]">Aggregating {selectedDim}...</p>
                        </div>
                    ) : data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#666666" }} interval={0} angle={-25} textAnchor="end" height={50} />
                                <YAxis
                                    tick={{ fontSize: 11, fill: "#666666" }}
                                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                                />
                                <Tooltip
                                    formatter={(val: unknown) => [
                                        Number(val).toLocaleString(),
                                        `${selectedMetric} (${aggMode.toUpperCase()})`,
                                    ]}
                                    contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E5", borderRadius: "6px", color: "#111111" }}
                                />
                                <Bar dataKey={aggMode} fill="#2563eb" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center rounded-md border border-dashed border-[#E5E5E5]">
                            <p className="text-xs text-[#999999]">No category breakdown data.</p>
                        </div>
                    )}
                </div>

                {/* Right: Ranked Cohort Data Table (5 cols) */}
                <div className="overflow-x-auto lg:col-span-5">
                    <div className="max-h-[280px] overflow-y-auto rounded-md border border-[#E5E5E5]">
                        <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-[#F7F7F7] text-[#666666] border-b border-[#E5E5E5]">
                                <tr>
                                    <th className="px-3 py-2 font-semibold">{selectedDim}</th>
                                    <th className="px-3 py-2 text-right font-semibold">
                                        {aggMode.toUpperCase()}
                                    </th>
                                    <th className="px-3 py-2 text-right font-semibold">Share</th>
                                    <th className="px-3 py-2 text-right font-semibold">Records</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E5E5]">
                                {data.map((row) => {
                                    const val = aggMode === "count" ? row.count : row[aggMode];
                                    const share = totalAgg > 0 ? ((val / totalAgg) * 100).toFixed(1) : "0";
                                    return (
                                        <tr key={row.category} className="hover:bg-[#F7F7F7]">
                                            <td className="px-3 py-2 font-medium text-[#111111]">
                                                {row.category}
                                            </td>
                                            <td className="px-3 py-2 text-right font-bold text-[#111111]">
                                                {val.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 text-right text-[#666666]">
                                                {share}%
                                            </td>
                                            <td className="px-3 py-2 text-right text-[#666666]">
                                                {row.count.toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}
