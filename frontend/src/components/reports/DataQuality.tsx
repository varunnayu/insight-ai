import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { DataQualityData } from "../../services/api";

interface DataQualityProps {
    quality: DataQualityData;
}

export default function DataQuality({ quality }: DataQualityProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pass":
                return <CheckCircle2 size={14} className="text-[#16a34a] shrink-0" />;
            case "warn":
                return <AlertTriangle size={14} className="text-[#ea580c] shrink-0" />;
            case "fail":
            default:
                return <XCircle size={14} className="text-[#dc2626] shrink-0" />;
        }
    };

    return (
        <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <ShieldCheck size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Data Quality & Hygiene Audit
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Completeness, deduplication, and anomaly assessment
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-3 py-1">
                        <span className="text-xs font-semibold text-[#111111]">
                            Rating: {quality.rating}
                        </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[#111111]">
                            {quality.score}
                        </span>
                        <span className="text-xs text-[#999999]">
                            / 100
                        </span>
                    </div>
                </div>
            </div>

            {/* Checklist items */}
            <div className="mt-4 space-y-2.5">
                {quality.deductions.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex items-start justify-between rounded-md border border-[#E5E5E5] bg-[#FFFFFF] p-3 text-xs transition hover:bg-[#FAFAFA]"
                    >
                        <div className="flex items-start gap-2.5">
                            <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                            <div>
                                <p className="font-semibold text-[#111111]">
                                    {item.check}
                                </p>
                                <p className="mt-0.5 text-xs text-[#666666]">
                                    {item.message}
                                </p>
                            </div>
                        </div>

                        {item.penalty > 0 ? (
                            <span className="shrink-0 font-mono font-medium text-[#ea580c]">
                                -{item.penalty} pts
                            </span>
                        ) : (
                            <span className="shrink-0 font-medium text-[#16a34a]">
                                0 deductions
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
