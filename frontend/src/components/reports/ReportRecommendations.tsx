import { Compass, CheckSquare2 } from "lucide-react";
import type { RecommendationItem } from "../../services/api";

interface ReportRecommendationsProps {
    recommendations: RecommendationItem[];
}

export default function ReportRecommendations({
    recommendations,
}: ReportRecommendationsProps) {
    if (!recommendations || recommendations.length === 0) {
        return (
            <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
                <div className="flex items-center gap-2.5 border-b border-[#E5E5E5] pb-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <Compass size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Strategic Recommendations
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Not enough patterns were detected to generate specific recommendations.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <Compass size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Strategic & Operational Recommendations
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Data-driven action plans grounded in statistical analysis
                        </p>
                    </div>
                </div>

                <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2.5 py-1 text-xs font-semibold text-[#111111]">
                    {recommendations.length} Action Items
                </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((rec, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-4 transition hover:bg-[#FAFAFA]"
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <CheckSquare2 size={14} className="text-[#16a34a] shrink-0" />
                                <h3 className="text-xs font-bold text-[#111111]">
                                    {rec.title}
                                </h3>
                            </div>

                            <p className="mt-2 text-xs leading-relaxed text-[#666666]">
                                {rec.description}
                            </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#E5E5E5]">
                            <span className="inline-block rounded border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#111111]">
                                {rec.type}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
