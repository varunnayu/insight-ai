import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FileText, Upload } from "lucide-react";

import { downloadReportPDF } from "../services/api";
import { useDataset } from "../context/DatasetContext";

import ReportHeader from "../components/reports/ReportHeader";
import ExecutiveSummary from "../components/reports/ExecutiveSummary";
import ReportMetrics from "../components/reports/ReportMetrics";
import DatasetOverview from "../components/reports/DatasetOverview";
import ReportCharts from "../components/reports/ReportCharts";
import StatisticalSummary from "../components/reports/StatisticalSummary";
import CategoricalAnalysis from "../components/reports/CategoricalAnalysis";
import CorrelationAnalysis from "../components/reports/CorrelationAnalysis";
import DataQuality from "../components/reports/DataQuality";
import ReportInsights from "../components/reports/ReportInsights";
import ReportRecommendations from "../components/reports/ReportRecommendations";

export default function Reports() {
    const {
        report,
        loadingReport,
        refreshReport,
        setUploadModalOpen,
    } = useDataset();

    const [refreshing, setRefreshing] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (!report && !loadingReport) {
            refreshReport();
        }
    }, [report, loadingReport, refreshReport]);

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const res = await refreshReport(true);
            if (res) {
                toast.success("Report refreshed successfully.");
            } else {
                toast.error("No active dataset to generate report.");
            }
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Failed to refresh report.";
            toast.error(msg);
        } finally {
            setRefreshing(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!report) return;

        try {
            setDownloading(true);
            toast.loading("Generating PDF report...", { id: "pdf-toast" });
            await downloadReportPDF(report.dataset_info.name);
            toast.success("PDF report downloaded successfully.", { id: "pdf-toast" });
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Unable to generate PDF report.";
            toast.error(msg, { id: "pdf-toast" });
        } finally {
            setDownloading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────
    // 1. Loading State
    // ─────────────────────────────────────────────────────────────
    if (loadingReport && !report) {
        return (
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="h-40 w-full rounded-md border border-[#E5E5E5] bg-white p-6" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 rounded-md border border-[#E5E5E5] bg-white p-4" />
                    ))}
                </div>
                <div className="h-48 w-full rounded-md border border-[#E5E5E5] bg-white p-6" />
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Empty State
    // ─────────────────────────────────────────────────────────────
    if (!report) {
        return (
            <div className="mx-auto max-w-4xl py-12 text-center">
                <section className="rounded-md border border-dashed border-[#E5E5E5] bg-white p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <FileText size={20} />
                    </div>

                    <h1 className="mt-4 text-xl font-bold tracking-tight text-[#111111]">
                        No Dataset Available
                    </h1>

                    <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#666666]">
                        Upload a CSV or Excel dataset to generate a comprehensive data report with executive summary,
                        metrics, charts, and downloadable PDF.
                    </p>

                    <div className="mt-6 flex justify-center">
                        <button
                            type="button"
                            onClick={() => setUploadModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-[#111111] bg-[#111111] px-4 py-2 text-xs font-medium text-white transition hover:bg-black"
                        >
                            <Upload size={14} />
                            <span>Upload Dataset</span>
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Complete Working Report View
    // ─────────────────────────────────────────────────────────────
    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-12">
            {/* Header */}
            <ReportHeader
                datasetInfo={report.dataset_info}
                onRefresh={handleRefresh}
                onDownloadPDF={handleDownloadPDF}
                onOpenUpload={() => setUploadModalOpen(true)}
                refreshing={refreshing}
                downloading={downloading}
            />

            {/* Section 1: Executive Summary */}
            <ExecutiveSummary
                summary={report.executive_summary}
                datasetInfo={report.dataset_info}
            />

            {/* Section 2: Key Metrics (KPIs) */}
            <ReportMetrics metrics={report.key_metrics} />

            {/* Section 3: Dataset Overview & Schema Table */}
            <DatasetOverview
                overview={report.dataset_overview}
                datasetName={report.dataset_info.name}
            />

            {/* Section 4: Automatic Visual Analysis (Monochrome Charts) */}
            {report.visual_analysis && report.visual_analysis.length > 0 && (
                <ReportCharts charts={report.visual_analysis} />
            )}

            {/* Section 5: Statistical Summary */}
            <StatisticalSummary summary={report.statistical_summary} />

            {/* Section 6: Categorical Analysis */}
            {report.categorical_analysis && report.categorical_analysis.length > 0 && (
                <CategoricalAnalysis items={report.categorical_analysis} />
            )}

            {/* Section 7: Correlation Analysis */}
            <CorrelationAnalysis data={report.correlation_analysis} />

            {/* Section 8: Data Quality Scorecard */}
            <DataQuality quality={report.data_quality} />

            {/* Section 9: Key Insights */}
            {report.insights && report.insights.length > 0 && (
                <ReportInsights insights={report.insights} />
            )}

            {/* Section 10: Recommendations */}
            <ReportRecommendations
                recommendations={report.recommendations}
            />
        </div>
    );
}
