import { Calculator } from "lucide-react";
import type { StatisticalSummaryItem } from "../../services/api";

interface StatisticalSummaryProps {
    summary: StatisticalSummaryItem[];
}

export default function StatisticalSummary({
    summary,
}: StatisticalSummaryProps) {
    if (!summary || summary.length === 0) {
        return (
            <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
                <div className="flex items-center gap-2.5 border-b border-[#E5E5E5] pb-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <Calculator size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Statistical Summary
                        </h2>
                        <p className="text-xs text-[#666666]">
                            No numeric features identified in this dataset.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <Calculator size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Statistical Summary
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Moments and dispersion across numeric dimensions
                        </p>
                    </div>
                </div>

                <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1 text-xs font-medium text-[#111111]">
                    {summary.length} Numeric {summary.length === 1 ? "Feature" : "Features"}
                </span>
            </div>

            <div className="mt-4 overflow-hidden rounded-md border border-[#E5E5E5]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[11px] font-semibold uppercase text-[#666666]">
                            <tr>
                                <th className="px-3 py-2">Column</th>
                                <th className="px-3 py-2 text-right">Count</th>
                                <th className="px-3 py-2 text-right">Mean</th>
                                <th className="px-3 py-2 text-right">Median</th>
                                <th className="px-3 py-2 text-right">Min</th>
                                <th className="px-3 py-2 text-right">Max</th>
                                <th className="px-3 py-2 text-right">Std Dev</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {summary.map((row) => (
                                <tr
                                    key={row.column}
                                    className="hover:bg-[#F7F7F7]"
                                >
                                    <td className="px-3 py-2 font-medium text-[#111111]">
                                        {row.column}
                                    </td>
                                    <td className="px-3 py-2 text-right text-[#666666]">
                                        {row.count.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono font-medium text-[#111111]">
                                        {row.mean.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-[#111111]">
                                        {row.median.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-[#666666]">
                                        {row.min.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-[#666666]">
                                        {row.max.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-[#666666]">
                                        {row.std_dev.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
