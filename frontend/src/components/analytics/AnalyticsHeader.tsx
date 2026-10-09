import { useState } from "react";
import {
    RefreshCw,
    Download,
    FileSpreadsheet,
    Package,
    TrendingUp,
    Boxes,
    Users,
    Briefcase,
    GraduationCap,
    DollarSign,
    Megaphone,
    Activity,
    Home,
    Globe,
    Database,
    Filter,
} from "lucide-react";
import toast from "react-hot-toast";

import type { UniversalDatasetMeta } from "../../services/api";
import { downloadReportPDF } from "../../services/api";

interface AnalyticsHeaderProps {
    dataset: UniversalDatasetMeta;
    onRefresh: () => Promise<void>;
    isRefreshing: boolean;
    rawRowsCount?: number;
    onExportCsv?: () => void;
}

export default function AnalyticsHeader({
    dataset,
    onRefresh,
    isRefreshing,
    onExportCsv,
}: AnalyticsHeaderProps) {
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const handleDownloadReport = async () => {
        try {
            setDownloadingPdf(true);
            toast.loading("Generating PDF Report...", { id: "pdf-toast" });
            await downloadReportPDF(dataset.name);
            toast.success("Report downloaded successfully!", { id: "pdf-toast" });
        } catch {
            toast.error("Failed to download PDF report", { id: "pdf-toast" });
        } finally {
            setDownloadingPdf(false);
        }
    };

    const getDomainIcon = (iconName: string) => {
        switch (iconName) {
            case "Package": return <Package size={14} className="text-[#111111]" />;
            case "TrendingUp": return <TrendingUp size={14} className="text-[#111111]" />;
            case "Boxes": return <Boxes size={14} className="text-[#111111]" />;
            case "Users": return <Users size={14} className="text-[#111111]" />;
            case "Briefcase": return <Briefcase size={14} className="text-[#111111]" />;
            case "GraduationCap": return <GraduationCap size={14} className="text-[#111111]" />;
            case "DollarSign": return <DollarSign size={14} className="text-[#111111]" />;
            case "Megaphone": return <Megaphone size={14} className="text-[#111111]" />;
            case "Activity": return <Activity size={14} className="text-[#111111]" />;
            case "Home": return <Home size={14} className="text-[#111111]" />;
            case "Globe": return <Globe size={14} className="text-[#111111]" />;
            default: return <Database size={14} className="text-[#111111]" />;
        }
    };

    const confidencePct = Math.round((dataset.confidence || 0.8) * 100);

    return (
        <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                {/* Left: Dataset info */}
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Domain Tag */}
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1 text-xs font-medium text-[#111111]">
                            {getDomainIcon(dataset.icon)}
                            <span>{dataset.type}</span>
                            <span className="text-[#666666]">
                                &bull; {confidencePct}% Match
                            </span>
                        </div>

                        {/* Filtered indicator */}
                        {dataset.is_filtered && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1 text-xs font-medium text-[#111111]">
                                <Filter size={12} />
                                Filtered Slice ({dataset.rows.toLocaleString()} / {dataset.total_rows.toLocaleString()})
                            </span>
                        )}
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[#111111] sm:text-2xl">
                            {dataset.name}
                        </h1>
                        <p className="mt-0.5 text-xs text-[#666666]">
                            {dataset.description || "Multi-dimensional intelligence, correlations, and distribution profiling."}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666]">
                        <span>
                            <strong className="font-semibold text-[#111111]">
                                {dataset.rows.toLocaleString()}
                            </strong>{" "}
                            records
                        </span>
                        <span>&bull;</span>
                        <span>
                            <strong className="font-semibold text-[#111111]">
                                {dataset.columns_count}
                            </strong>{" "}
                            attributes
                        </span>
                        {dataset.currency_symbol && (
                            <>
                                <span>&bull;</span>
                                <span>
                                    Currency:{" "}
                                    <strong className="font-semibold text-[#111111]">
                                        {dataset.currency_symbol}
                                    </strong>
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    {onExportCsv && (
                        <button
                            type="button"
                            onClick={onExportCsv}
                            className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#111111] transition hover:bg-[#F7F7F7]"
                        >
                            <FileSpreadsheet size={13} className="text-[#111111]" />
                            <span>Export CSV</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleDownloadReport}
                        disabled={downloadingPdf}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#111111] transition hover:bg-[#F7F7F7] disabled:opacity-50"
                    >
                        <Download size={13} className="text-[#111111]" />
                        <span>{downloadingPdf ? "Generating..." : "Download PDF"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#111111] bg-[#111111] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-black disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
                        <span>{isRefreshing ? "Analyzing..." : "Refresh"}</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
