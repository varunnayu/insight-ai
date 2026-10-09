import { Layers } from "lucide-react";
import type { CategoricalAnalysisItem } from "../../services/api";

interface CategoricalAnalysisProps {
    items: CategoricalAnalysisItem[];
}

export default function CategoricalAnalysis({ items }: CategoricalAnalysisProps) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <Layers size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Categorical Dimension Analysis
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Cardinality, dominant modes, and distribution profiles
                        </p>
                    </div>
                </div>

                <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1 text-xs font-semibold text-[#111111]">
                    {items.length} {items.length === 1 ? "Category" : "Categories"} Analyzed
                </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((cat) => (
                    <div
                        key={cat.column}
                        className="rounded-md border border-[#E5E5E5] bg-white p-4 transition hover:bg-[#FAFAFA]"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xs font-bold text-[#111111]">
                                    {cat.column}
                                </h3>
                                <p className="text-[11px] text-[#666666]">
                                    {cat.unique_count} distinct {cat.unique_count === 1 ? "value" : "values"}
                                </p>
                            </div>

                            <span className="rounded border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-medium text-[#111111]">
                                Mode: {cat.most_frequent}
                            </span>
                        </div>

                        {/* Top segment share */}
                        <div className="mt-3 rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-2.5 text-xs">
                            <div className="flex items-center justify-between text-[#666666]">
                                <span>
                                    Dominant: <strong className="text-[#111111]">{cat.most_frequent}</strong>
                                </span>
                                <span className="font-semibold text-[#2563eb]">{cat.most_frequent_pct}%</span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full rounded bg-[#E5E5E5] overflow-hidden">
                                <div
                                    className="h-full rounded bg-[#2563eb] transition-all duration-500"
                                    style={{ width: `${Math.min(100, cat.most_frequent_pct)}%` }}
                                />
                            </div>
                        </div>

                        {/* Top 5 distribution */}
                        <div className="mt-3 space-y-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#999999]">
                                Top Distributions
                            </p>
                            {cat.distribution.map((dist, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-[11px] text-[#666666]">
                                        <span className="truncate max-w-[150px]">{dist.label}</span>
                                        <span className="font-medium text-[#111111]">{dist.percentage}%</span>
                                    </div>
                                    <div className="h-1 w-full rounded bg-[#E5E5E5] overflow-hidden">
                                        <div
                                            className="h-full rounded bg-[#0d9488]"
                                            style={{ width: `${dist.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
