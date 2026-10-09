import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Search, MapPin, Loader2 } from "lucide-react";
import {
    getMissingDetails,
    type ColumnIntel,
    type MissingCellDetail,
} from "../../services/api";

interface MissingValuesExplorerProps {
    columns: ColumnIntel[];
    totalRows: number;
    totalMissing: number;
}

export default function MissingValuesExplorer({
    columns,
    totalRows,
    totalMissing,
}: MissingValuesExplorerProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"columns" | "locations">("columns");
    const [missingDetails, setMissingDetails] = useState<MissingCellDetail[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (totalMissing > 0 && viewMode === "locations" && missingDetails.length === 0) {
            setLoadingDetails(true);
            getMissingDetails()
                .then((res) => {
                    if (res.success) {
                        setMissingDetails(res.missing_details);
                    }
                })
                .catch(console.error)
                .finally(() => setLoadingDetails(false));
        }
    }, [totalMissing, viewMode, missingDetails.length]);

    const filtered = columns.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const columnsWithMissing = columns.filter((c) => c.missing_count > 0);
    const completeColumns = columns.filter((c) => c.missing_count === 0);

    const filteredLocations = missingDetails.filter(
        (m) =>
            m.column_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(m.row_number).includes(searchTerm)
    );

    return (
        <section className="space-y-4 rounded-md border border-[#E5E5E5] bg-white p-5">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <AlertCircle size={15} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Missing Values Explorer
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Column-level completeness evaluation across {totalRows.toLocaleString()} dataset rows
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* View Switcher: Columns vs Exact Locations */}
                    {totalMissing > 0 && (
                        <div className="inline-flex rounded-md border border-[#E5E5E5] bg-[#F7F7F7] p-0.5 text-xs">
                            <button
                                type="button"
                                onClick={() => setViewMode("columns")}
                                className={`rounded px-2 py-1 text-xs transition ${
                                    viewMode === "columns"
                                        ? "bg-white text-[#111111] font-semibold shadow-sm"
                                        : "text-[#666666] hover:text-[#111111]"
                                }`}
                            >
                                By Column
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("locations")}
                                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition ${
                                    viewMode === "locations"
                                        ? "bg-white text-[#111111] font-semibold shadow-sm"
                                        : "text-[#666666] hover:text-[#111111]"
                                }`}
                            >
                                <MapPin size={11} />
                                <span>Exact Cell Locations</span>
                            </button>
                        </div>
                    )}

                    <div className="relative">
                        <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999999]"
                        />
                        <input
                            type="text"
                            placeholder="Search column or row..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-44 rounded-md border border-[#E5E5E5] bg-white py-1.5 pl-7 pr-2.5 text-xs text-[#111111] placeholder-[#999999] focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stat Summary Strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <span className="text-[11px] font-medium text-[#666666]">Total Missing Cells</span>
                    <p className="mt-1 text-lg font-bold text-[#111111]">
                        {totalMissing.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <span className="text-[11px] font-medium text-[#666666]">Affected Columns</span>
                    <p className="mt-1 text-lg font-bold text-[#111111]">
                        {columnsWithMissing.length} / {columns.length}
                    </p>
                </div>

                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <span className="text-[11px] font-medium text-[#666666]">Complete Columns</span>
                    <p className="mt-1 text-lg font-bold text-[#111111]">
                        {completeColumns.length}
                    </p>
                </div>

                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <span className="text-[11px] font-medium text-[#666666]">Overall Completeness</span>
                    <p className="mt-1 text-lg font-bold text-[#111111]">
                        {totalRows > 0 && columns.length > 0
                            ? `${(
                                  (1 - totalMissing / (totalRows * columns.length)) *
                                  100
                              ).toFixed(1)}%`
                            : "100%"}
                    </p>
                </div>
            </div>

            {/* View 1: Column-Level Summary */}
            {viewMode === "columns" && (
                <div className="overflow-x-auto rounded-md border border-[#E5E5E5]">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[11px] font-semibold uppercase text-[#666666]">
                            <tr>
                                <th className="px-3 py-2">Column Name</th>
                                <th className="px-3 py-2">Semantic Role</th>
                                <th className="px-3 py-2 text-right">Missing Cells</th>
                                <th className="px-3 py-2 text-right">Missing Percentage</th>
                                <th className="px-3 py-2 text-right">Completeness</th>
                                <th className="px-3 py-2 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {filtered.map((col) => {
                                const completeness = Math.max(0, 100 - col.missing_pct);
                                const hasMissing = col.missing_count > 0;

                                return (
                                    <tr key={col.name} className="hover:bg-[#F7F7F7]">
                                        <td className="px-3 py-2 font-medium text-[#111111]">
                                            {col.name}
                                        </td>
                                        <td className="px-3 py-2 capitalize text-[#666666]">
                                            {col.role}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono text-[#111111]">
                                            {col.missing_count.toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono text-[#111111]">
                                            {col.missing_pct}%
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono text-[#111111]">
                                            {completeness.toFixed(1)}%
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {hasMissing ? (
                                                <span className="inline-flex items-center gap-1 rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[10px] font-medium text-[#ea580c]">
                                                    {col.missing_count} missing
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#16a34a]">
                                                    <CheckCircle2 size={12} />
                                                    Complete
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-xs text-[#999999]">
                                        No columns match "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View 2: Exact Cell Locations */}
            {viewMode === "locations" && (
                <div className="overflow-x-auto rounded-md border border-[#E5E5E5]">
                    {loadingDetails ? (
                        <div className="py-12 text-center">
                            <Loader2 size={24} className="mx-auto animate-spin text-[#111111]" />
                            <p className="mt-2 text-xs text-[#666666]">Locating exact missing cells...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[11px] font-semibold uppercase text-[#666666]">
                                <tr>
                                    <th className="px-3 py-2">CSV Data Row #</th>
                                    <th className="px-3 py-2">Column Name</th>
                                    <th className="px-3 py-2 text-right">DataFrame Index</th>
                                    <th className="px-3 py-2 text-center">Value Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E5E5]">
                                {filteredLocations.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-[#F7F7F7]">
                                        <td className="px-3 py-2 font-mono text-[#111111]">
                                            Row {m.row_number} (1-indexed CSV)
                                        </td>
                                        <td className="px-3 py-2 font-medium text-[#111111]">
                                            {m.column_name}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono text-[#666666]">
                                            {m.dataframe_index}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className="rounded border border-[#E5E5E5] bg-[#FFF7ED] px-2 py-0.5 font-mono text-[10px] text-[#ea580c]">
                                                {m.value_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}

                                {filteredLocations.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-xs text-[#999999]">
                                            {missingDetails.length === 0
                                                ? "No missing cell locations found."
                                                : `No locations match "${searchTerm}"`}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </section>
    );
}
