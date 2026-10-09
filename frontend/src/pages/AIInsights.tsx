import { useEffect, useState } from "react";
import { Lightbulb, Upload, Loader2, ArrowRight } from "lucide-react";
import { useDataset } from "../context/DatasetContext";
import { getInsights, type BusinessInsight, type InsightSummary } from "../services/api";

export default function AIInsights() {
    const { dataset, setUploadModalOpen } = useDataset();
    const [insights, setInsights] = useState<BusinessInsight[]>([]);
    const [summary, setSummary] = useState<InsightSummary | null>(null);
    const [datasetType, setDatasetType] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dataset) {
            setLoading(true);
            getInsights()
                .then((res) => {
                    if (res.success) {
                        setInsights(res.insights);
                        setSummary(res.summary);
                        if (res.dataset_type) setDatasetType(res.dataset_type);
                    }
                })
                .catch(() => {
                    setInsights([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [dataset]);

    if (!dataset) {
        return (
            <div className="mx-auto max-w-4xl py-12 text-center">
                <section className="rounded-md border border-dashed border-[#E5E5E5] bg-white p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <Lightbulb size={20} />
                    </div>

                    <h1 className="mt-4 text-xl font-bold tracking-tight text-[#111111]">
                        Business Insights
                    </h1>

                    <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#666666]">
                        Upload a dataset to generate automated rule-based findings,
                        priority risk indicators, and actionable business recommendations.
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

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-12">
            {/* Header */}
            <section className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] pb-5 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
                        Business Insights
                    </h1>
                    <p className="mt-1 text-xs text-[#666666] sm:text-sm">
                        Rule-based findings and priority risk indicators for {dataset.filename} ({datasetType || "General"})
                    </p>
                </div>

                {summary && (
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1 font-medium text-[#111111]">
                            {summary.total_insights} Total Insights
                        </span>
                        {summary.high_priority > 0 && (
                            <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1 font-medium text-[#111111]">
                                {summary.high_priority} High Priority
                            </span>
                        )}
                        {summary.positive_findings > 0 && (
                            <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1 font-medium text-[#111111]">
                                {summary.positive_findings} Positive Signals
                            </span>
                        )}
                    </div>
                )}
            </section>

            {/* Simple text notice for disabled LLM functionality */}
            <div className="rounded-md border border-[#E5E5E5] bg-white p-3 text-xs text-[#666666]">
                Notice: External conversational LLM integration is disabled. Showing automated rule-based analytical findings computed directly from dataset patterns.
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex min-h-[240px] items-center justify-center rounded-md border border-[#E5E5E5] bg-white py-12">
                    <div className="text-center">
                        <Loader2 size={24} className="mx-auto animate-spin text-[#111111]" />
                        <p className="mt-3 text-xs font-medium text-[#666666]">Computing insights...</p>
                    </div>
                </div>
            )}

            {/* Insights Cards Grid */}
            {!loading && insights.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {insights.map((insight, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-5"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-sm font-semibold text-[#111111]">
                                        {insight.title}
                                    </h3>
                                    <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-medium capitalize text-[#111111]">
                                        {insight.severity} Priority
                                    </span>
                                </div>

                                <p className="mt-3 text-xs leading-relaxed text-[#666666]">
                                    {insight.description}
                                </p>
                            </div>

                            {insight.recommendation && (
                                <div className="mt-4 border-t border-[#E5E5E5] pt-3">
                                    <div className="flex items-start gap-1.5 text-xs text-[#111111]">
                                        <ArrowRight size={13} className="mt-0.5 shrink-0 text-[#666666]" />
                                        <span>
                                            <strong className="font-medium text-[#111111]">Recommendation: </strong>
                                            {insight.recommendation}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!loading && insights.length === 0 && (
                <div className="rounded-md border border-dashed border-[#E5E5E5] bg-white p-8 text-center text-xs text-[#666666]">
                    No specific automated patterns detected for this dataset slice.
                </div>
            )}
        </div>
    );
}