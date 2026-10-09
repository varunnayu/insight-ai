import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { fetchDistribution, type DistributionBin, type NumericStat } from "../../services/api";

interface DistributionExplorerProps {
    metrics: string[];
    numericStats: NumericStat[];
    initialMetric?: string;
    currencySymbol?: string;
}

export default function DistributionExplorer({
    metrics,
    numericStats,
    initialMetric,
    currencySymbol = "$",
}: DistributionExplorerProps) {
    const [selectedMetric, setSelectedMetric] = useState<string>(initialMetric || metrics[0] || "");
    const [binsCount, setBinsCount] = useState<number>(12);
    const [bins, setBins] = useState<DistributionBin[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (metrics.length > 0 && !selectedMetric) {
            setSelectedMetric(metrics[0]);
        }
    }, [metrics, selectedMetric]);

    useEffect(() => {
        if (selectedMetric) {
            let isCurrent = true;
            setLoading(true);
            fetchDistribution(selectedMetric, binsCount)
                .then((res) => {
                    if (isCurrent && res.success) {
                        setBins(res.bins);
                    }
                })
                .catch(() => {
                    // Ignore
                })
                .finally(() => {
                    if (isCurrent) setLoading(false);
                });

            return () => {
                isCurrent = false;
            };
        }
    }, [selectedMetric, binsCount]);

    if (metrics.length === 0) {
        return (
            <section className="rounded-md border border-dashed border-[#E5E5E5] bg-white p-6 text-center">
                <p className="text-xs text-[#666666]">
                    Numeric distribution analysis is unavailable because no numeric metrics were detected.
                </p>
            </section>
        );
    }

    const currentStat = numericStats.find((s) => s.column === selectedMetric);
    const isCurrency = currentStat?.semantic_type === "PRICE";
    const symbol = isCurrency ? currencySymbol : "";

    return (
        <section className="space-y-4 rounded-md border border-[#E5E5E5] bg-white p-5">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <BarChart3 size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Distribution & Histogram Explorer
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Frequency distribution and statistical dispersion
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Metric dropdown */}
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

                    {/* Bins count selector */}
                    <div className="flex items-center gap-1 text-xs text-[#666666]">
                        <span>Bins:</span>
                        {[8, 12, 16, 20].map((b) => (
                            <button
                                key={b}
                                type="button"
                                onClick={() => setBinsCount(b)}
                                className={`rounded px-2 py-0.5 text-xs font-medium transition ${
                                    binsCount === b
                                        ? "border border-[#111111] bg-[#111111] text-white"
                                        : "border border-[#E5E5E5] bg-white text-[#666666] hover:bg-[#F7F7F7]"
                                }`}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Histogram chart & descriptive stat cards */}
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Left: Histogram Chart (8 cols) */}
                <div className="h-[280px] lg:col-span-8">
                    {loading ? (
                        <div className="flex h-full items-center justify-center rounded-md bg-[#F7F7F7]">
                            <p className="text-xs text-[#666666]">Computing distribution bins for {selectedMetric}...</p>
                        </div>
                    ) : bins.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bins}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#666666" }} interval={0} angle={-20} textAnchor="end" height={45} />
                                <YAxis tick={{ fontSize: 11, fill: "#666666" }} />
                                <Tooltip
                                    formatter={(val: unknown) => [
                                        `${Number(val).toLocaleString()} records`,
                                        "Frequency",
                                    ]}
                                    contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E5", borderRadius: "6px", color: "#111111" }}
                                />
                                <Bar dataKey="count" fill="#0d9488" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center rounded-md border border-dashed border-[#E5E5E5]">
                            <p className="text-xs text-[#999999]">No histogram data available.</p>
                        </div>
                    )}
                </div>

                {/* Right: Descriptive Stats Summary (4 cols) */}
                {currentStat && (
                    <div className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-4 lg:col-span-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
                                <span className="text-xs font-semibold text-[#111111]">
                                    {selectedMetric} Stats
                                </span>
                                <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-medium text-[#111111]">
                                    {currentStat.semantic_type}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="rounded border border-[#E5E5E5] bg-[#FFFFFF] p-2">
                                    <p className="text-[10px] text-[#666666]">Mean</p>
                                    <p className="font-bold text-[#111111]">
                                        {symbol}{currentStat.mean.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded border border-[#E5E5E5] bg-[#FFFFFF] p-2">
                                    <p className="text-[10px] text-[#666666]">Median</p>
                                    <p className="font-bold text-[#111111]">
                                        {symbol}{currentStat.median.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded border border-[#E5E5E5] bg-[#FFFFFF] p-2">
                                    <p className="text-[10px] text-[#666666]">Min</p>
                                    <p className="font-bold text-[#111111]">
                                        {symbol}{currentStat.min.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded border border-[#E5E5E5] bg-[#FFFFFF] p-2">
                                    <p className="text-[10px] text-[#666666]">Max</p>
                                    <p className="font-bold text-[#111111]">
                                        {symbol}{currentStat.max.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded border border-[#E5E5E5] bg-[#FFFFFF] p-2">
                                    <p className="text-[10px] text-[#666666]">Std Dev</p>
                                    <p className="font-bold text-[#111111]">
                                        {currentStat.std_dev.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded border border-[#E5E5E5] bg-[#FFFFFF] p-2">
                                    <p className="text-[10px] text-[#666666]">Skewness</p>
                                    <p className="font-bold text-[#111111]">
                                        {currentStat.skewness > 0 ? `+${currentStat.skewness}` : currentStat.skewness}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="mt-3 text-[11px] text-[#666666]">
                            {Math.abs(currentStat.skewness) < 0.5
                                ? "Symmetric, bell-like distribution."
                                : currentStat.skewness > 0
                                    ? "Right-skewed with high positive tail."
                                    : "Left-skewed with lower extreme values."}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
