import { Lightbulb, ArrowRight } from "lucide-react";
import type { BusinessInsight } from "../../services/api";

interface InsightsCardProps {
    insights: BusinessInsight[];
    datasetType?: string;
}

export default function InsightsCard({ insights, datasetType }: InsightsCardProps) {
    if (!insights || insights.length === 0) return null;

    return (
        <section className="space-y-4 rounded-md border border-[#E5E5E5] bg-white p-5">
            {/* Header */}
            <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                    <Lightbulb size={14} />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-[#111111]">
                        Rule-Based Intelligence & Insights
                    </h2>
                    <p className="text-xs text-[#666666]">
                        Derived from statistical patterns and business rules for {datasetType || "this dataset"}
                    </p>
                </div>
            </div>

            {/* Insights Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {insights.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-4"
                    >
                        <div>
                            <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs font-semibold text-[#111111]">
                                    {item.title}
                                </h4>
                                <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-medium capitalize text-[#111111]">
                                    {item.severity}
                                </span>
                            </div>

                            <p className="mt-2 text-xs leading-relaxed text-[#666666]">
                                {item.description}
                            </p>
                        </div>

                        {item.recommendation && (
                            <div className="mt-3 flex items-start gap-1.5 border-t border-[#E5E5E5] pt-2 text-xs text-[#111111]">
                                <ArrowRight size={13} className="mt-0.5 shrink-0 text-[#666666]" />
                                <span>{item.recommendation}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
