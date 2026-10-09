import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { OutlierItem } from "../../services/api";

interface OutlierPanelProps {
    outliers: OutlierItem[];
    currencySymbol?: string;
}

export default function OutlierPanel({ outliers, currencySymbol = "$" }: OutlierPanelProps) {
    if (!outliers || outliers.length === 0) {
        return (
            <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
                <div className="flex items-center gap-2 text-[#111111]">
                    <CheckCircle2 size={16} />
                    <h2 className="text-sm font-semibold">Outlier Detection (IQR Method)</h2>
                </div>
                <p className="mt-2 text-xs text-[#666666]">
                    No numeric metrics available for outlier calculation.
                </p>
            </section>
        );
    }

    return (
        <section className="space-y-4 rounded-md border border-[#E5E5E5] bg-white p-5">
            {/* Header */}
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <AlertCircle size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Statistical Outlier Detection
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Interquartile Range (1.5 x IQR) anomaly detection
                        </p>
                    </div>
                </div>

                <span className="text-xs text-[#666666]">
                    {outliers.length} metrics audited
                </span>
            </div>

            {/* Outlier Grid Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {outliers.map((item) => {
                    const isCurrency = item.semantic_type === "PRICE";
                    const symbol = isCurrency ? currencySymbol : "";
                    const hasOutliers = item.outlier_count > 0;

                    return (
                        <div
                            key={item.column}
                            className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-4"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-[#111111]">
                                        {item.column}
                                    </span>
                                    <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-medium text-[#111111]">
                                        {item.status}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold tracking-tight text-[#111111]">
                                        {item.outlier_count.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-[#666666]">
                                        outliers ({item.outlier_percentage}% of {item.total_analyzed.toLocaleString()})
                                    </span>
                                </div>

                                {/* IQR Bounds range box */}
                                <div className="mt-3 rounded-md border border-[#E5E5E5] bg-white p-2.5 text-[11px]">
                                    <div className="flex justify-between text-[#666666]">
                                        <span>IQR Bounds:</span>
                                        <span className="font-medium text-[#111111]">
                                            IQR = {symbol}{item.iqr.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="mt-1 font-mono text-xs font-semibold text-[#111111]">
                                        [{symbol}{item.lower_bound.toLocaleString()} - {symbol}{item.upper_bound.toLocaleString()}]
                                    </p>
                                </div>
                            </div>

                            {/* Upper/Lower breakdown */}
                            {hasOutliers ? (
                                <div className="mt-3 border-t border-[#E5E5E5] pt-2 text-[11px] text-[#666666]">
                                    {item.upper_outliers_count > 0 && (
                                        <p>
                                            <strong className="text-[#111111]">{item.upper_outliers_count}</strong> upper anomalies (sample: {symbol}{item.sample_upper[0]})
                                        </p>
                                    )}
                                    {item.lower_outliers_count > 0 && (
                                        <p className="mt-0.5">
                                            <strong className="text-[#111111]">{item.lower_outliers_count}</strong> lower anomalies
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-3 border-t border-[#E5E5E5] pt-2 text-[11px] text-[#666666]">
                                    All values lie within expected statistical thresholds.
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
