import { CheckCircle2, BookOpen } from "lucide-react";
import type { ReportExecutiveSummary, ReportDatasetInfo } from "../../services/api";

interface ExecutiveSummaryProps {
    summary: ReportExecutiveSummary;
    datasetInfo: ReportDatasetInfo;
}

export default function ExecutiveSummary({
    summary,
    datasetInfo,
}: ExecutiveSummaryProps) {
    return (
        <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <BookOpen size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Executive Summary
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Operational synopsis and findings
                        </p>
                    </div>
                </div>

                <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1 text-xs font-medium text-[#111111]">
                    {datasetInfo.rows.toLocaleString()} Records
                </span>
            </div>

            {/* Narrative */}
            <div className="mt-4">
                <p className="text-xs leading-relaxed text-[#111111] sm:text-sm">
                    {summary.narrative}
                </p>
            </div>

            {/* Highlights Bullet List */}
            {summary.highlights && summary.highlights.length > 0 && (
                <div className="mt-4 rounded-md border border-[#E5E5E5] bg-white p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                        Key Operational Observations
                    </h3>

                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {summary.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs text-[#111111]">
                                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#111111]" />
                                <span>{highlight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
