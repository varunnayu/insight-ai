import {
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    AlertCircle,
    Info,
} from "lucide-react";
import type { DataQualityReport } from "../../services/api";

interface DataQualityCardProps {
    quality: DataQualityReport;
}

export default function DataQualityCard({ quality }: DataQualityCardProps) {
    if (!quality) return null;

    const { score, rating, checks } = quality;

    const renderCheckIcon = (status: string) => {
        switch (status) {
            case "pass":
                return <CheckCircle2 size={15} className="text-[#111111]" />;
            case "warning":
                return <AlertTriangle size={15} className="text-[#666666]" />;
            case "fail":
                return <AlertCircle size={15} className="text-[#111111]" />;
            default:
                return <Info size={15} className="text-[#666666]" />;
        }
    };

    return (
        <section className="space-y-4 rounded-md border border-[#E5E5E5] bg-white p-5">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <ShieldCheck size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Data Quality & Hygiene Audit
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Algorithmic scoring of completeness, deduplication, schema validity, and outliers
                        </p>
                    </div>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-2xl font-bold tracking-tight text-[#111111]">
                            {score}
                        </span>
                        <span className="text-xs text-[#666666]"> / 100</span>
                        <p className="text-[11px] font-medium text-[#666666]">
                            {rating} Rating
                        </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-xs font-bold text-[#111111]">
                        {score}%
                    </div>
                </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <p className="text-[11px] text-[#666666]">Completeness</p>
                    <p className="mt-0.5 text-sm font-bold text-[#111111]">
                        {((1 - quality.total_missing / (quality.total_cells || 1)) * 100).toFixed(1)}%
                    </p>
                </div>
                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <p className="text-[11px] text-[#666666]">Missing Cells</p>
                    <p className="mt-0.5 text-sm font-bold text-[#111111]">
                        {quality.total_missing.toLocaleString()}
                    </p>
                </div>
                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <p className="text-[11px] text-[#666666]">Duplicate Rows</p>
                    <p className="mt-0.5 text-sm font-bold text-[#111111]">
                        {quality.duplicate_rows.toLocaleString()}
                    </p>
                </div>
                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <p className="text-[11px] text-[#666666]">Empty Columns</p>
                    <p className="mt-0.5 text-sm font-bold text-[#111111]">
                        {quality.empty_columns_count}
                    </p>
                </div>
                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <p className="text-[11px] text-[#666666]">Isolated IDs</p>
                    <p className="mt-0.5 text-sm font-bold text-[#111111]">
                        {quality.identifier_columns_count}
                    </p>
                </div>
            </div>

            {/* Diagnostic Checklist */}
            <div className="grid gap-2.5 sm:grid-cols-2">
                {checks.map((chk, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-3 rounded-md border border-[#E5E5E5] bg-white p-3"
                    >
                        <div className="mt-0.5 shrink-0">{renderCheckIcon(chk.status)}</div>
                        <div>
                            <p className="text-xs font-semibold text-[#111111]">
                                {chk.type}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#666666]">
                                {chk.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
