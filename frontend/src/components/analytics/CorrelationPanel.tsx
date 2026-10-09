import { GitCommit, Info } from "lucide-react";
import type { CorrelationData } from "../../services/api";

interface CorrelationPanelProps {
    correlations: CorrelationData;
}

export default function CorrelationPanel({ correlations }: CorrelationPanelProps) {
    if (!correlations.available || !correlations.pairs || correlations.pairs.length === 0) {
        return (
            <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
                <div className="flex items-center gap-2 text-[#111111]">
                    <GitCommit size={16} />
                    <h2 className="text-sm font-semibold">Correlation Analysis</h2>
                </div>
                <p className="mt-2 text-xs text-[#666666]">
                    {correlations.message || "At least 2 numeric metrics are required for correlation analysis."}
                </p>
            </section>
        );
    }

    const { pairs, columns, matrix } = correlations;

    return (
        <section className="space-y-4 rounded-md border border-[#E5E5E5] bg-white p-5">
            {/* Header */}
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <GitCommit size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Bivariate Correlation Matrix
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Pearson correlation coefficients among numeric metrics
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#666666]">
                    <Info size={13} />
                    <span>Scale: -1.00 (inverse) to +1.00 (direct)</span>
                </div>
            </div>

            {/* Pairwise Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pairs.slice(0, 6).map((pair) => (
                    <div
                        key={`${pair.col1}-${pair.col2}`}
                        className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-4"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#111111]">
                                {pair.col1} &harr; {pair.col2}
                            </span>
                            <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-medium text-[#111111]">
                                {pair.strength}
                            </span>
                        </div>

                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-bold tracking-tight text-[#111111]">
                                {pair.correlation > 0 ? `+${pair.correlation.toFixed(2)}` : pair.correlation.toFixed(2)}
                            </span>
                            <span className="text-xs text-[#666666]">Pearson r</span>
                        </div>

                        <p className="mt-2 text-[11px] leading-relaxed text-[#666666]">
                            {pair.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Matrix Table */}
            {columns && columns.length > 2 && matrix && (
                <div className="mt-4 overflow-x-auto rounded-md border border-[#E5E5E5]">
                    <table className="w-full text-center text-xs">
                        <thead className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[#666666]">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold">Metric</th>
                                {columns.map((c) => (
                                    <th key={c} className="px-3 py-2 font-semibold">
                                        {c}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {matrix.map((row) => (
                                <tr key={row.column} className="hover:bg-[#F7F7F7]">
                                    <td className="px-3 py-2 text-left font-medium text-[#111111]">
                                        {row.column}
                                    </td>
                                    {columns.map((c) => {
                                        const val = Number(row[c] ?? 0);
                                        const isDiag = row.column === c;
                                        return (
                                            <td
                                                key={c}
                                                className={`px-3 py-2 font-mono ${
                                                    isDiag
                                                        ? "bg-[#F7F7F7] font-bold text-[#111111]"
                                                        : Math.abs(val) >= 0.5
                                                        ? "font-bold text-[#111111]"
                                                        : "text-[#666666]"
                                                }`}
                                            >
                                                {isDiag ? "1.00" : val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
