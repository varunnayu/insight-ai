import { useState, useCallback } from "react";
import { BarChart3, Loader2, Upload, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { useDataset } from "../context/DatasetContext";
import { getAnalytics, type FilterPayload, type UniversalAnalyticsData } from "../services/api";

import AnalyticsHeader from "../components/analytics/AnalyticsHeader";
import AnalyticsKPIs from "../components/analytics/AnalyticsKPIs";
import AnalyticsFilters from "../components/analytics/AnalyticsFilters";
import StatisticalSummaryTable from "../components/analytics/StatisticalSummaryTable";
import AutomaticCharts from "../components/analytics/AutomaticCharts";
import CategoryExplorer from "../components/analytics/CategoryExplorer";
import DistributionExplorer from "../components/analytics/DistributionExplorer";
import CorrelationPanel from "../components/analytics/CorrelationPanel";
import OutlierPanel from "../components/analytics/OutlierPanel";
import DataQualityCard from "../components/analytics/DataQualityCard";
import MissingValuesExplorer from "../components/analytics/MissingValuesExplorer";
import ColumnExplorer from "../components/analytics/ColumnExplorer";
import DatasetPreviewTable from "../components/analytics/DatasetPreviewTable";
import InsightsCard from "../components/analytics/InsightsCard";

export default function Analytics() {
    const {
        dataset,
        analytics,
        loadingAnalytics,
        refreshAnalytics,
        setUploadModalOpen,
    } = useDataset();

    const [filteredAnalytics, setFilteredAnalytics] = useState<UniversalAnalyticsData | null>(null);
    const [activeFilters, setActiveFilters] = useState<FilterPayload>({});
    const [isFiltering, setIsFiltering] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const activeData = filteredAnalytics || analytics;

    const handleApplyFilters = useCallback(async (filters: FilterPayload) => {
        try {
            setIsFiltering(true);
            setActiveFilters(filters);
            const res = await getAnalytics(filters);
            if (res.success) {
                setFilteredAnalytics(res.analytics);
                toast.success(`Filter applied (${res.analytics.dataset.rows.toLocaleString()} records)`);
            }
        } catch {
            toast.error("Failed to apply filters");
        } finally {
            setIsFiltering(false);
        }
    }, []);

    const handleClearFilters = useCallback(() => {
        setActiveFilters({});
        setFilteredAnalytics(null);
        toast.success("Filters cleared");
    }, []);

    const handleRefresh = useCallback(async () => {
        try {
            setIsRefreshing(true);
            await refreshAnalytics();
            setFilteredAnalytics(null);
            setActiveFilters({});
            toast.success("Analytics refreshed");
        } catch {
            toast.error("Failed to refresh analytics");
        } finally {
            setIsRefreshing(false);
        }
    }, [refreshAnalytics]);

    const handleExportCsv = useCallback(() => {
        if (!activeData || !activeData.preview_rows || activeData.preview_rows.length === 0) {
            toast.error("No data to export");
            return;
        }
        const cols = activeData.columns_summary.all;
        const rows = activeData.preview_rows;
        const csvContent = [
            cols.join(","),
            ...rows.map((r) =>
                cols.map((c) => {
                    const val = r[c] ?? "";
                    return typeof val === "string" && (val.includes(",") || val.includes('"'))
                        ? `"${val.replace(/"/g, '""')}"`
                        : val;
                }).join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `InsightAI_${activeData.dataset.name.replace(/\.[^/.]+$/, "")}_Export.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Exported CSV successfully");
    }, [activeData]);

    // -------------------------------------------------------------
    // EMPTY STATE: No Dataset Uploaded
    // -------------------------------------------------------------
    if (!dataset && !activeData) {
        return (
            <div className="mx-auto max-w-5xl space-y-6">
                <section className="flex flex-col items-center justify-center rounded-md border border-dashed border-[#E5E5E5] bg-white p-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <BarChart3 size={20} />
                    </div>

                    <h1 className="mt-4 text-xl font-bold tracking-tight text-[#111111]">
                        Universal Dataset Analytics
                    </h1>

                    <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#666666]">
                        Upload any structured dataset to automatically generate
                        statistical analysis, correlations, and distribution profiling.
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
            </div>
        );
    }

    // -------------------------------------------------------------
    // LOADING STATE
    // -------------------------------------------------------------
    if (loadingAnalytics && !activeData) {
        return (
            <div className="flex min-h-[300px] items-center justify-center rounded-md border border-[#E5E5E5] bg-white py-16">
                <div className="text-center">
                    <Loader2 size={28} className="mx-auto animate-spin text-[#111111]" />
                    <p className="mt-3 text-xs font-semibold text-[#111111]">
                        Analyzing dataset intelligence...
                    </p>
                </div>
            </div>
        );
    }

    if (!activeData) {
        return (
            <div className="rounded-md border border-[#E5E5E5] bg-white p-6 text-center text-[#111111]">
                <AlertCircle size={20} className="mx-auto text-[#666666]" />
                <p className="mt-2 text-xs font-medium text-[#666666]">Unable to analyze this dataset.</p>
            </div>
        );
    }

    // -------------------------------------------------------------
    // MAIN ANALYTICS DASHBOARD
    // -------------------------------------------------------------
    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-12">
            {/* 1. Dataset Overview */}
            <AnalyticsHeader
                dataset={activeData.dataset}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing || isFiltering}
                onExportCsv={handleExportCsv}
            />

            {/* Interactive Filters Bar */}
            <AnalyticsFilters
                categoricalBreakdowns={activeData.categorical_breakdowns || []}
                numericStats={activeData.numeric_statistics || []}
                dateColumns={activeData.columns_summary.dates || []}
                activeFilters={activeFilters}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                isFiltered={Boolean(activeData.dataset.is_filtered)}
            />

            {/* 2. Key Metrics */}
            <AnalyticsKPIs kpis={activeData.kpis || []} />

            {/* 3. Statistical Summary */}
            <StatisticalSummaryTable stats={activeData.numeric_statistics || []} />

            {/* 4. Automatic Visualizations */}
            {activeData.charts && (
                <AutomaticCharts
                    charts={activeData.charts}
                    currencySymbol={activeData.dataset.currency_symbol || "$"}
                />
            )}

            {/* Interactive Dimension Explorers */}
            {activeData.selectors.dimensions.length > 0 && (
                <CategoryExplorer
                    dimensions={activeData.selectors.dimensions}
                    metrics={activeData.selectors.metrics}
                    initialDim={activeData.selectors.dimensions[0]}
                    initialMetric={activeData.selectors.metrics[0]}
                />
            )}

            {activeData.selectors.metrics.length > 0 && (
                <DistributionExplorer
                    metrics={activeData.selectors.metrics}
                    numericStats={activeData.numeric_statistics || []}
                    initialMetric={activeData.selectors.metrics[0]}
                    currencySymbol={activeData.dataset.currency_symbol || "$"}
                />
            )}

            {/* 5. Correlation Analysis */}
            <CorrelationPanel correlations={activeData.correlations} />

            {/* 6. Outlier Detection */}
            <OutlierPanel
                outliers={activeData.outliers || []}
                currencySymbol={activeData.dataset.currency_symbol || "$"}
            />

            {/* 7. Data Quality */}
            <DataQualityCard quality={activeData.data_quality} />

            {/* 8. Missing Values Explorer */}
            <MissingValuesExplorer
                columns={activeData.columns_intelligence || []}
                totalRows={activeData.dataset.total_rows}
                totalMissing={activeData.data_quality?.total_missing || 0}
            />

            {/* 9. Column Explorer */}
            <ColumnExplorer
                columns={activeData.columns_intelligence || []}
                currencySymbol={activeData.dataset.currency_symbol || "$"}
            />

            {/* Sample Records Table */}
            <DatasetPreviewTable
                rows={activeData.preview_rows || []}
                columns={activeData.columns_summary.all || []}
                totalRows={activeData.dataset.total_rows}
                filename={activeData.dataset.name}
            />

            {/* 10. Insights */}
            <InsightsCard
                insights={(activeData as unknown as { insights?: Array<unknown> }).insights as never || []}
                datasetType={activeData.dataset.type}
            />
        </div>
    );
}
