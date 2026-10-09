import { ArrowUpRight, ArrowDownRight, Minus, Network } from "lucide-react";
import type { CorrelationAnalysisData } from "../../services/api";

interface CorrelationAnalysisProps {
    data: CorrelationAnalysisData;
}

export default function CorrelationAnalysis({
    data,
}: CorrelationAnalysisProps) {
    if (!data.has_correlation || !data.pairs || data.pairs.length === 0) {
        return (
            <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
                <div className="flex items-center gap-2.5 border-b border-[#E5E5E5] pb-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <Network size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Bivariate Correlation Analysis
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Mutual dependency & linear statistical relationship
                        </p>
                    </div>
                </div>

                <div className="mt-4 rounded-md border border-dashed border-[#E5E5E5] bg-white p-6 text-center">
                    <p className="text-xs text-[#666666]">
                        {data.message ||
                            "Correlation analysis requires at least two numeric columns."}
                    </p>
                </div>
            </section>
        );
    }

    const getStrengthBadge = (strength: string, direction: string) => {
        if (strength === "Strong") {
            return direction === "Positive" ? (
                <span className="inline-flex items-center gap-1 rounded border border-[#16a34a] bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#16a34a]">
                    <ArrowUpRight size={11} /> Strong Positive
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 rounded border border-[#ea580c] bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-semibold text-[#ea580c]">
                    <ArrowDownRight size={11} /> Strong Negative
                </span>
            );
        } else if (strength === "Moderate") {
            return (
                <span className="inline-flex items-center gap-1 rounded border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-semibold text-[#111111]">
                    <ArrowUpRight size={11} /> Moderate {direction}
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1 rounded border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-0.5 text-[10px] font-medium text-[#666666]">
                    <Minus size={11} /> Weak
                </span>
            );
        }
    };

    return (
        <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <Network size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Bivariate Correlation Analysis
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Pearson correlation coefficient (r) between numeric variables
                        </p>
                    </div>
                </div>

                <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1 text-xs font-semibold text-[#111111]">
                    {data.pairs.length} {data.pairs.length === 1 ? "Pair" : "Pairs"} Evaluated
                </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.pairs.map((pair, idx) => (
                    <div
                        key={idx}
                        className="rounded-md border border-[#E5E5E5] bg-white p-4 transition hover:bg-[#FAFAFA]"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#111111]">
                                {pair.col1} &harr; {pair.col2}
                            </span>
                            {getStrengthBadge(pair.strength, pair.direction || (pair.correlation > 0 ? "Positive" : "Negative"))}
                        </div>

                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-xl font-bold tracking-tight text-[#111111]">
                                {pair.correlation > 0 ? `+${pair.correlation}` : pair.correlation}
                            </span>
                            <span className="text-xs text-[#666666]">
                                Pearson r
                            </span>
                        </div>

                        <p className="mt-2 text-xs leading-relaxed text-[#666666]">
                            {pair.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
