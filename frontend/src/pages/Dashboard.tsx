import { BarChart3, Loader2, Upload, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import DatasetProfile from "../components/ui/DatasetProfile";
import AnalyticsDashboard from "../components/ui/AnalyticsDashboard";
import DatasetPreviewTable from "../components/analytics/DatasetPreviewTable";
import { useDataset } from "../context/DatasetContext";

export default function Dashboard() {
    const {
        dataset,
        analytics,
        loadingAnalytics,
        setUploadModalOpen,
    } = useDataset();

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* 1. Page title and Upload Dataset action */}
            <section className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] pb-5 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
                        Business Overview
                    </h1>

                    <p className="mt-1 text-xs text-[#666666] sm:text-sm">
                        {dataset
                            ? `Active analysis of dataset ${dataset.filename} with automated profiling and key metrics.`
                            : "Upload a structured dataset to generate comprehensive business metrics."}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setUploadModalOpen(true)}
                    className="w-fit rounded-md border border-[#E5E5E5] bg-white px-3.5 py-2 text-xs font-medium text-[#111111] transition hover:bg-[#F7F7F7]"
                >
                    {dataset ? "Replace Dataset" : "Upload Dataset"}
                </button>
            </section>

            {/* Empty State: No Dataset */}
            {!dataset && (
                <section className="rounded-md border border-dashed border-[#E5E5E5] bg-white p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <BarChart3 size={20} />
                    </div>

                    <h2 className="mt-4 text-base font-semibold text-[#111111]">
                        No active dataset loaded
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#666666]">
                        Upload a CSV or Excel dataset to generate automated profiling,
                        health diagnostics, and key metrics.
                    </p>

                    <button
                        type="button"
                        onClick={() => setUploadModalOpen(true)}
                        className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#111111] bg-[#111111] px-4 py-2 text-xs font-medium text-white transition hover:bg-black"
                    >
                        <Upload size={14} />
                        <span>Upload Dataset</span>
                    </button>
                </section>
            )}

            {/* Dataset Loaded */}
            {dataset && (
                <>
                    {/* 2. Compact active-dataset summary (displayed only ONCE) */}
                    <section className="flex flex-col justify-between gap-4 rounded-md border border-[#E5E5E5] bg-white p-4 sm:flex-row sm:items-center">
                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#999999]">
                                Active Dataset
                            </span>
                            <h2 className="text-base font-bold text-[#111111]">
                                {dataset.filename}
                            </h2>
                            <p className="mt-0.5 text-xs text-[#666666]">
                                {dataset.profile.rows.toLocaleString()} rows &bull; {dataset.profile.columns} columns
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setUploadModalOpen(true)}
                            className="inline-flex w-fit items-center gap-2 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#111111] transition hover:bg-[#F7F7F7]"
                        >
                            <Upload size={13} />
                            <span>Replace Dataset</span>
                        </button>
                    </section>

                    {/* 3 & 4. Dataset Health KPI Cards (Interactive) & Dataset Column Overview */}
                    <DatasetProfile profile={dataset.profile} />

                    {/* Loading State */}
                    {loadingAnalytics && (
                        <div className="flex items-center justify-center rounded-md border border-[#E5E5E5] bg-white py-16">
                            <div className="text-center">
                                <Loader2
                                    size={28}
                                    className="mx-auto animate-spin text-[#111111]"
                                />

                                <p className="mt-3 text-xs font-semibold text-[#111111]">
                                    Calculating metrics...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 5 & 6. Relevant Dataset-Specific KPI Cards & 2-3 Useful Visualizations */}
                    {!loadingAnalytics && analytics && (
                        <AnalyticsDashboard analytics={analytics} />
                    )}

                    {/* 7. Compact Raw-Data Preview */}
                    <DatasetPreviewTable
                        rows={analytics?.preview_rows}
                        columns={
                            analytics?.columns_summary?.all ||
                            dataset.profile.column_details.map((c) => c.name)
                        }
                        totalRows={dataset.profile.rows}
                        filename={dataset.filename}
                    />

                    {/* 8. Link to Detailed Analytics Page */}
                    <div className="flex flex-col justify-between gap-3 rounded-md border border-[#E5E5E5] bg-white p-4 sm:flex-row sm:items-center">
                        <div>
                            <h4 className="text-xs font-semibold text-[#111111]">
                                Deep-Dive Universal Analytics
                            </h4>
                            <p className="text-xs text-[#666666]">
                                Explore correlations, outlier detection, filters, distributions, and column intelligence.
                            </p>
                        </div>

                        <Link
                            to="/analytics"
                            className="inline-flex items-center gap-2 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#111111] transition hover:bg-[#F7F7F7]"
                        >
                            <span>Open Detailed Analytics</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}