import { Download, RefreshCw, Upload, FileText, Database, Calendar } from "lucide-react";
import type { ReportDatasetInfo } from "../../services/api";

interface ReportHeaderProps {
    datasetInfo: ReportDatasetInfo;
    onRefresh: () => Promise<void>;
    onDownloadPDF: () => Promise<void>;
    onOpenUpload: () => void;
    refreshing: boolean;
    downloading: boolean;
}

export default function ReportHeader({
    datasetInfo,
    onRefresh,
    onDownloadPDF,
    onOpenUpload,
    refreshing,
    downloading,
}: ReportHeaderProps) {
    const domainLabels: Record<string, string> = {
        sales: "Sales & Commerce",
        education: "Academic Performance",
        hr: "Human Resources",
        finance: "Financial Analytics",
        marketing: "Marketing & Growth",
        generic: "Structured Data",
    };

    const domainDisplay = domainLabels[datasetInfo.domain] || "General Analytics";

    return (
        <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                {/* Left column info */}
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1 text-xs font-medium text-[#111111]">
                            <FileText size={13} className="text-[#111111]" />
                            Report
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1 text-xs font-medium text-[#111111]">
                            {domainDisplay}
                        </span>
                    </div>

                    <h1 className="mt-3 text-xl font-bold tracking-tight text-[#111111] sm:text-2xl">
                        Comprehensive Data Report
                    </h1>

                    <p className="mt-1 text-xs text-[#666666]">
                        Statistical synthesis and automated metric analysis for{" "}
                        <span className="font-semibold text-[#111111]">{datasetInfo.name}</span>
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#666666]">
                        <span className="flex items-center gap-1.5">
                            <Database size={13} className="text-[#666666]" />
                            {datasetInfo.rows.toLocaleString()} rows &bull; {datasetInfo.columns} columns
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#666666]" />
                            Analyzed: {datasetInfo.uploaded_at}
                        </span>
                        <span>&bull;</span>
                        <span>
                            Memory: {datasetInfo.memory_usage}
                        </span>
                    </div>
                </div>

                {/* Right column action buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={onOpenUpload}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#111111] transition hover:bg-[#F7F7F7]"
                    >
                        <Upload size={13} />
                        <span>Upload Data</span>
                    </button>

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#111111] transition hover:bg-[#F7F7F7] disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                        <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={onDownloadPDF}
                        disabled={downloading}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#111111] bg-[#111111] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-black disabled:opacity-50"
                    >
                        <Download size={13} />
                        <span>{downloading ? "Building PDF..." : "Download PDF"}</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
