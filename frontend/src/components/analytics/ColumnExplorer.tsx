import { useState } from "react";
import {
    Search,
    Columns,
    Hash,
    Key,
    Calendar,
    Type,
    Tag,
    X,
} from "lucide-react";
import type { ColumnIntel } from "../../services/api";

interface ColumnExplorerProps {
    columns: ColumnIntel[];
    currencySymbol?: string;
}

export default function ColumnExplorer({ columns }: ColumnExplorerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [inspectColumn, setInspectColumn] = useState<ColumnIntel | null>(null);

    const filtered = columns.filter((col) => {
        const matchesSearch = col.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || col.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleIcon = (role: string) => {
        const props = { size: 14, className: "text-[#111111]" };
        switch (role) {
            case "identifier": return <Key {...props} />;
            case "metric": return <Hash {...props} />;
            case "dimension": return <Tag {...props} />;
            case "temporal": return <Calendar {...props} />;
            case "metadata": return <Tag {...props} />;
            default: return <Type {...props} />;
        }
    };

    return (
        <section className="space-y-4 rounded-md border border-[#E5E5E5] bg-white p-5">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <Columns size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Column Explorer
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Semantic roles, data types, cardinality ratios, and sample inspection
                        </p>
                    </div>
                </div>

                {/* Search & Role Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999999]"
                        />
                        <input
                            type="text"
                            placeholder="Search column..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-44 rounded-md border border-[#E5E5E5] bg-white py-1.5 pl-7 pr-2.5 text-xs text-[#111111] placeholder-[#999999] focus:outline-none"
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1.5 text-xs text-[#111111] focus:outline-none"
                    >
                        <option value="all">All Roles ({columns.length})</option>
                        <option value="metric">Metrics</option>
                        <option value="dimension">Dimensions</option>
                        <option value="identifier">Identifiers</option>
                        <option value="temporal">Dates / Temporal</option>
                        <option value="metadata">Metadata / Constant</option>
                        <option value="text">Freeform Text</option>
                    </select>
                </div>
            </div>

            {/* Column Cards Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((col) => (
                    <div
                        key={col.name}
                        onClick={() => setInspectColumn(col)}
                        className="group flex cursor-pointer flex-col justify-between rounded-md border border-[#E5E5E5] bg-white p-4 transition hover:bg-[#F7F7F7]"
                    >
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    {getRoleIcon(col.role)}
                                    <h4 className="truncate text-xs font-semibold text-[#111111]">
                                        {col.name}
                                    </h4>
                                </div>
                                <span className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-medium capitalize text-[#111111]">
                                    {col.semantic_type.toLowerCase()}
                                </span>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#666666]">
                                <div>
                                    <span className="text-[#999999]">Type:</span>{" "}
                                    <span className="font-mono text-[#111111]">
                                        {col.dtype}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#999999]">Unique:</span>{" "}
                                    <span className="font-medium text-[#111111]">
                                        {col.unique_count.toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#999999]">Missing:</span>{" "}
                                    <span className="font-medium text-[#111111]">
                                        {col.missing_count} ({col.missing_pct}%)
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#999999]">Role:</span>{" "}
                                    <span className="capitalize text-[#111111]">
                                        {col.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Sample preview */}
                        <div className="mt-3 border-t border-[#E5E5E5] pt-2 text-[10px] text-[#666666]">
                            <span className="text-[#999999]">Samples: </span>
                            <span className="text-[#111111]">
                                {col.sample_values.slice(0, 3).join(", ") || "-"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Column Inspection Modal */}
            {inspectColumn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="relative w-full max-w-xl rounded-md border border-[#E5E5E5] bg-white p-6 shadow-lg">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setInspectColumn(null)}
                            className="absolute right-4 top-4 rounded-md p-1.5 text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                {getRoleIcon(inspectColumn.role)}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#111111]">
                                    {inspectColumn.name}
                                </h3>
                                <p className="text-xs text-[#666666]">
                                    Semantic Type: {inspectColumn.semantic_type} &bull; Role: {inspectColumn.role}
                                </p>
                            </div>
                        </div>

                        {/* Summary Grid */}
                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                                <p className="text-[10px] text-[#666666]">Data Type</p>
                                <p className="font-mono text-xs font-bold text-[#111111]">
                                    {inspectColumn.dtype}
                                </p>
                            </div>
                            <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                                <p className="text-[10px] text-[#666666]">Distinct Values</p>
                                <p className="text-xs font-bold text-[#111111]">
                                    {inspectColumn.unique_count.toLocaleString()}
                                </p>
                            </div>
                            <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                                <p className="text-[10px] text-[#666666]">Missing Count</p>
                                <p className="text-xs font-bold text-[#111111]">
                                    {inspectColumn.missing_count} ({inspectColumn.missing_pct}%)
                                </p>
                            </div>
                            <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                                <p className="text-[10px] text-[#666666]">Unique Ratio</p>
                                <p className="text-xs font-bold text-[#111111]">
                                    {(inspectColumn.unique_ratio * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>

                        {/* If Metric, show Stats */}
                        {inspectColumn.stats && (
                            <div className="mt-4 rounded-md border border-[#E5E5E5] bg-white p-4">
                                <h4 className="text-xs font-bold text-[#111111]">
                                    Descriptive Numerical Statistics
                                </h4>
                                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <span className="text-[#666666]">Mean:</span>{" "}
                                        <strong className="text-[#111111]">{inspectColumn.stats.mean.toLocaleString()}</strong>
                                    </div>
                                    <div>
                                        <span className="text-[#666666]">Median:</span>{" "}
                                        <strong className="text-[#111111]">{inspectColumn.stats.median.toLocaleString()}</strong>
                                    </div>
                                    <div>
                                        <span className="text-[#666666]">Min:</span>{" "}
                                        <strong className="text-[#111111]">{inspectColumn.stats.min.toLocaleString()}</strong>
                                    </div>
                                    <div>
                                        <span className="text-[#666666]">Max:</span>{" "}
                                        <strong className="text-[#111111]">{inspectColumn.stats.max.toLocaleString()}</strong>
                                    </div>
                                    <div>
                                        <span className="text-[#666666]">Std Dev:</span>{" "}
                                        <strong className="text-[#111111]">{inspectColumn.stats.std_dev.toLocaleString()}</strong>
                                    </div>
                                    <div>
                                        <span className="text-[#666666]">Sum:</span>{" "}
                                        <strong className="text-[#111111]">{inspectColumn.stats.sum.toLocaleString()}</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sample Values */}
                        <div className="mt-4">
                            <h4 className="text-xs font-bold text-[#111111]">
                                Sample Record Values
                            </h4>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {inspectColumn.sample_values.map((v, i) => (
                                    <span
                                        key={i}
                                        className="rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-1 text-xs text-[#111111]"
                                    >
                                        {v}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Dismiss */}
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setInspectColumn(null)}
                                className="rounded-md border border-[#E5E5E5] bg-white px-4 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#F7F7F7]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
