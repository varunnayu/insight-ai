import { Lightbulb, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import type { BusinessInsight } from "../../services/api";

interface ReportInsightsProps {
    insights: BusinessInsight[];
}

export default function ReportInsights({ insights }: ReportInsightsProps) {
    if (!insights || insights.length === 0) {
        return null;
    }

    const getSeverityBadge = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "high":
                return (
                    <span className="inline-flex items-center gap-1 rounded border border-[#ea580c] bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-semibold text-[#ea580c]">
                        <AlertTriangle size={11} /> High Priority
                    </span>
                );
            case "positive":
                return (
                    <span className="inline-flex items-center gap-1 rounded border border-[#16a34a] bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#16a34a]">
                        <CheckCircle2 size={11} /> Positive Signal
                    </span>
                );
            case "medium":
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-medium text-[#111111]">
                        <TrendingUp size={11} /> Medium Priority
                    </span>
                );
        }
    };

    return (
        <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <Lightbulb size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Key Rule-Based Insights
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Automated findings and risk indicators detected by the analytics engine
                        </p>
                    </div>
                </div>

                <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1 text-xs font-semibold text-[#111111]">
                    {insights.length} {insights.length === 1 ? "Finding" : "Findings"}
                </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {insights.map((insight, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-4 transition hover:bg-[#FAFAFA]"
                    >
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="text-xs font-bold text-[#111111]">
                                    {insight.title}
                                </h3>
                                {getSeverityBadge(insight.severity)}
                            </div>

                            <p className="mt-2 text-xs leading-relaxed text-[#666666]">
                                {insight.description}
                            </p>
                        </div>

                        {insight.recommendation && (
                            <div className="mt-3 rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-2.5 text-xs text-[#111111]">
                                <span className="font-semibold text-[#111111]">Recommended Action: </span>
                                <span className="text-[#666666]">{insight.recommendation}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
