import { useState, useEffect } from "react";
import { Filter, RotateCcw, ChevronDown } from "lucide-react";
import type { CategoricalBreakdown, NumericStat, FilterPayload } from "../../services/api";

interface AnalyticsFiltersProps {
    categoricalBreakdowns: CategoricalBreakdown[];
    numericStats: NumericStat[];
    dateColumns: string[];
    activeFilters: FilterPayload;
    onApplyFilters: (filters: FilterPayload) => void;
    onClearFilters: () => void;
    isFiltered: boolean;
}

export default function AnalyticsFilters({
    categoricalBreakdowns,
    numericStats,
    dateColumns,
    activeFilters,
    onApplyFilters,
    onClearFilters,
    isFiltered,
}: AnalyticsFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [catDraft, setCatDraft] = useState<Record<string, string>>({});
    const [numDraft, setNumDraft] = useState<Record<string, { min?: number; max?: number }>>({});
    const [dateDraft, setDateDraft] = useState<Record<string, { start?: string; end?: string }>>({});

    useEffect(() => {
        const initialCat: Record<string, string> = {};
        if (activeFilters.categorical) {
            for (const [k, v] of Object.entries(activeFilters.categorical)) {
                if (typeof v === "string") {
                    initialCat[k] = v;
                } else if (Array.isArray(v) && v.length > 0) {
                    initialCat[k] = v[0];
                }
            }
        }
        setCatDraft(initialCat);
        setNumDraft(activeFilters.numeric || {});
        setDateDraft(activeFilters.date || {});
    }, [activeFilters]);

    const activeCount =
        Object.values(catDraft).filter(Boolean).length +
        Object.values(numDraft).filter((b) => b.min !== undefined || b.max !== undefined).length +
        Object.values(dateDraft).filter((d) => Boolean(d.start || d.end)).length;

    const handleApply = () => {
        const payload: FilterPayload = {
            categorical: {},
            numeric: {},
            date: {},
        };

        for (const [k, v] of Object.entries(catDraft)) {
            if (v && v !== "all") {
                payload.categorical![k] = v;
            }
        }

        for (const [k, b] of Object.entries(numDraft)) {
            if (b.min !== undefined || b.max !== undefined) {
                payload.numeric![k] = b;
            }
        }

        for (const [k, d] of Object.entries(dateDraft)) {
            if (d.start || d.end) {
                payload.date![k] = d;
            }
        }

        onApplyFilters(payload);
    };

    const handleClear = () => {
        setCatDraft({});
        setNumDraft({});
        setDateDraft({});
        onClearFilters();
    };

    const primaryCats = categoricalBreakdowns.slice(0, 3);
    const primaryNums = numericStats.slice(0, 2);

    return (
        <section className="rounded-md border border-[#E5E5E5] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <Filter size={14} />
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold text-[#111111]">
                            Data Filters
                        </h3>
                        <p className="text-[11px] text-[#666666]">
                            Drill down into specific cohorts, ranges, or segments
                        </p>
                    </div>

                    {isFiltered && (
                        <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-medium text-[#111111]">
                            {activeCount} active
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isFiltered && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="inline-flex items-center gap-1 rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-medium text-[#111111] hover:bg-[#F7F7F7]"
                        >
                            <RotateCcw size={11} />
                            <span>Clear</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-3 py-1 text-xs font-medium text-[#111111] hover:bg-[#F7F7F7]"
                    >
                        <span>{isOpen ? "Hide Controls" : "Filter Controls"}</span>
                        <ChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Expandable Filter Controls */}
            {isOpen && (
                <div className="mt-4 space-y-4 border-t border-[#E5E5E5] pt-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {/* Categorical dropdowns */}
                        {primaryCats.map((cat) => (
                            <div key={cat.column} className="space-y-1">
                                <label className="text-xs font-medium text-[#666666]">
                                    {cat.column}
                                </label>
                                <select
                                    value={catDraft[cat.column] || "all"}
                                    onChange={(e) =>
                                        setCatDraft((prev) => ({
                                            ...prev,
                                            [cat.column]: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1.5 text-xs text-[#111111] focus:outline-none"
                                >
                                    <option value="all">All {cat.column}s</option>
                                    {cat.distribution.map((item) => (
                                        <option key={item.label} value={item.label}>
                                            {item.label} ({item.count.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}

                        {/* Numeric min/max inputs */}
                        {primaryNums.map((num) => (
                            <div key={num.column} className="space-y-1">
                                <label className="text-xs font-medium text-[#666666]">
                                    {num.column} (Min - Max)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder={`Min (${num.min})`}
                                        value={numDraft[num.column]?.min ?? ""}
                                        onChange={(e) =>
                                            setNumDraft((prev) => ({
                                                ...prev,
                                                [num.column]: {
                                                    ...prev[num.column],
                                                    min: e.target.value ? Number(e.target.value) : undefined,
                                                },
                                            }))
                                        }
                                        className="w-1/2 rounded-md border border-[#E5E5E5] bg-white px-2 py-1.5 text-xs text-[#111111] focus:outline-none"
                                    />
                                    <span className="text-[#999999]">-</span>
                                    <input
                                        type="number"
                                        placeholder={`Max (${num.max})`}
                                        value={numDraft[num.column]?.max ?? ""}
                                        onChange={(e) =>
                                            setNumDraft((prev) => ({
                                                ...prev,
                                                [num.column]: {
                                                    ...prev[num.column],
                                                    max: e.target.value ? Number(e.target.value) : undefined,
                                                },
                                            }))
                                        }
                                        className="w-1/2 rounded-md border border-[#E5E5E5] bg-white px-2 py-1.5 text-xs text-[#111111] focus:outline-none"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Date range if date column exists */}
                        {dateColumns.length > 0 && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#666666]">
                                    Date Range ({dateColumns[0]})
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={dateDraft[dateColumns[0]]?.start ?? ""}
                                        onChange={(e) =>
                                            setDateDraft((prev) => ({
                                                ...prev,
                                                [dateColumns[0]]: {
                                                    ...prev[dateColumns[0]],
                                                    start: e.target.value || undefined,
                                                },
                                            }))
                                        }
                                        className="w-1/2 rounded-md border border-[#E5E5E5] bg-white px-2 py-1.5 text-xs text-[#111111] focus:outline-none"
                                    />
                                    <span className="text-[#999999]">-</span>
                                    <input
                                        type="date"
                                        value={dateDraft[dateColumns[0]]?.end ?? ""}
                                        onChange={(e) =>
                                            setDateDraft((prev) => ({
                                                ...prev,
                                                [dateColumns[0]]: {
                                                    ...prev[dateColumns[0]],
                                                    end: e.target.value || undefined,
                                                },
                                            }))
                                        }
                                        className="w-1/2 rounded-md border border-[#E5E5E5] bg-white px-2 py-1.5 text-xs text-[#111111] focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Apply Action */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleApply}
                            className="rounded-md border border-[#111111] bg-[#111111] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-black"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
