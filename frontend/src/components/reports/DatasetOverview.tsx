import { useState } from "react";
import { Table, Search, Hash, AlignLeft, Calendar } from "lucide-react";
import type { ReportDatasetOverview } from "../../services/api";

interface DatasetOverviewProps {
    overview: ReportDatasetOverview;
    datasetName: string;
}

export default function DatasetOverview({
    overview,
    datasetName,
}: DatasetOverviewProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredColumns = overview.column_details.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const getTypeBadge = (type: string) => {
        switch (type.toLowerCase()) {
            case "numeric":
                return (
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#111111]">
                        <Hash size={11} /> Numeric
                    </span>
                );
            case "date":
                return (
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#111111]">
                        <Calendar size={11} /> Date
                    </span>
                );
            case "categorical":
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-0.5 text-[11px] font-medium text-[#111111]">
                        <AlignLeft size={11} /> Categorical
                    </span>
                );
        }
    };

    return (
        <section className="rounded-md border border-[#E5E5E5] bg-white p-5">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <Table size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Dataset Overview & Schema
                        </h2>
                        <p className="text-xs text-[#666666]">
                            Structural composition and attributes for {datasetName}
                        </p>
                    </div>
                </div>

                <div className="relative w-full sm:w-56">
                    <Search
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999999]"
                    />
                    <input
                        type="text"
                        placeholder="Filter columns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-md border border-[#E5E5E5] bg-white py-1.5 pl-7 pr-2.5 text-xs text-[#111111] placeholder-[#999999] focus:outline-none"
                    />
                </div>
            </div>

            {/* Quick Stat Tiles */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <p className="text-[11px] font-medium text-[#666666]">Total Rows</p>
                    <p className="mt-1 text-base font-bold text-[#111111]">
                        {overview.rows.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <p className="text-[11px] font-medium text-[#666666]">Total Columns</p>
                    <p className="mt-1 text-base font-bold text-[#111111]">
                        {overview.columns}
                    </p>
                </div>

                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <p className="text-[11px] font-medium text-[#666666]">Numeric Cols</p>
                    <p className="mt-1 text-base font-bold text-[#111111]">
                        {overview.numeric_count}
                    </p>
                </div>

                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <p className="text-[11px] font-medium text-[#666666]">Categorical Cols</p>
                    <p className="mt-1 text-base font-bold text-[#111111]">
                        {overview.categorical_count}
                    </p>
                </div>

                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <p className="text-[11px] font-medium text-[#666666]">Missing Values</p>
                    <p className="mt-1 text-base font-bold text-[#111111]">
                        {overview.missing_values.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                    <p className="text-[11px] font-medium text-[#666666]">Duplicate Rows</p>
                    <p className="mt-1 text-base font-bold text-[#111111]">
                        {overview.duplicate_rows.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Detected Columns Table */}
            <div className="mt-4 overflow-hidden rounded-md border border-[#E5E5E5]">
                <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 z-10 border-b border-[#E5E5E5] bg-[#F7F7F7] text-[11px] font-semibold uppercase text-[#666666]">
                            <tr>
                                <th className="px-3 py-2">Column Name</th>
                                <th className="px-3 py-2">Detected Type</th>
                                <th className="px-3 py-2">Data Type</th>
                                <th className="px-3 py-2 text-right">Missing</th>
                                <th className="px-3 py-2 text-right">Unique Values</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {filteredColumns.map((col) => (
                                <tr
                                    key={col.name}
                                    className="hover:bg-[#F7F7F7]"
                                >
                                    <td className="px-3 py-2 font-medium text-[#111111]">
                                        {col.name}
                                    </td>
                                    <td className="px-3 py-2">
                                        {getTypeBadge(col.detected_type)}
                                    </td>
                                    <td className="px-3 py-2 font-mono text-[11px] text-[#666666]">
                                        {col.dtype}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-[#111111]">
                                        {col.missing}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-[#111111]">
                                        {col.unique.toLocaleString()}
                                    </td>
                                </tr>
                            ))}

                            {filteredColumns.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-6 text-center text-xs text-[#999999]"
                                    >
                                        No columns match "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
