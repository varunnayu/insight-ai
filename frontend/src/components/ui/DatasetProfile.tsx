import { useState } from "react";
import {
    AlertCircle,
    Calendar,
    Copy,
    Database,
    Hash,
    Table2,
    X,
    Loader2,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

import {
    getMissingDetails,
    getDuplicateDetails,
    type DatasetProfile as Profile,
    type MissingDetailsResponse,
    type DuplicateDetailsResponse,
} from "../../services/api";

interface DatasetProfileProps {
    profile: Profile;
}

export default function DatasetProfile({ profile }: DatasetProfileProps) {
    const [missingModalOpen, setMissingModalOpen] = useState(false);
    const [missingData, setMissingData] = useState<MissingDetailsResponse | null>(null);
    const [loadingMissing, setLoadingMissing] = useState(false);

    const [dupModalOpen, setDupModalOpen] = useState(false);
    const [dupData, setDupData] = useState<DuplicateDetailsResponse | null>(null);
    const [loadingDup, setLoadingDup] = useState(false);

    // Open and fetch missing details
    const handleOpenMissing = async () => {
        setMissingModalOpen(true);
        if (!missingData) {
            setLoadingMissing(true);
            try {
                const res = await getMissingDetails();
                setMissingData(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingMissing(false);
            }
        }
    };

    // Open and fetch duplicate details
    const handleOpenDuplicates = async () => {
        setDupModalOpen(true);
        if (!dupData) {
            setLoadingDup(true);
            try {
                const res = await getDuplicateDetails();
                setDupData(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingDup(false);
            }
        }
    };

    // Scroll to raw data preview
    const handleScrollToData = () => {
        const el = document.getElementById("raw-data-preview");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    const healthStats = [
        {
            label: "Total Rows",
            value: profile.rows.toLocaleString(),
            icon: Database,
            interactive: true,
            hint: "Click to explore raw dataset preview",
            onClick: handleScrollToData,
        },
        {
            label: "Columns",
            value: profile.columns.toLocaleString(),
            icon: Table2,
            interactive: false,
            hint: null,
            onClick: undefined,
        },
        {
            label: "Missing Values",
            value: profile.missing_values.toLocaleString(),
            icon: AlertCircle,
            interactive: true,
            hint: profile.missing_values > 0 ? "Click to view missing-value details" : "100% complete dataset",
            onClick: handleOpenMissing,
            highlightColor: profile.missing_values > 0 ? "text-[#ea580c]" : undefined,
        },
        {
            label: "Duplicate Rows",
            value: profile.duplicate_rows.toLocaleString(),
            icon: Copy,
            interactive: true,
            hint: profile.duplicate_rows > 0 ? "Click to view duplicate records" : "No duplicates detected",
            onClick: handleOpenDuplicates,
            highlightColor: profile.duplicate_rows > 0 ? "text-[#ea580c]" : undefined,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Section C: Dataset health KPI cards */}
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                        Dataset Health Diagnostics
                    </h3>
                    <span className="text-[11px] text-[#999999]">
                        Interactive KPI cards &bull; click for deep inspection
                    </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {healthStats.map((stat) => {
                        const Icon = stat.icon;

                        if (stat.interactive && stat.onClick) {
                            return (
                                <button
                                    key={stat.label}
                                    type="button"
                                    onClick={stat.onClick}
                                    className="group text-left rounded-md border border-[#E5E5E5] bg-white p-4 transition hover:border-[#111111] hover:bg-[#FAFAFA] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-[#666666] group-hover:text-[#111111]">
                                            {stat.label}
                                        </span>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111] group-hover:border-[#111111]">
                                            <Icon size={14} />
                                        </div>
                                    </div>

                                    <p className={`mt-3 text-2xl font-bold tracking-tight text-[#111111] ${stat.highlightColor || ""}`}>
                                        {stat.value}
                                    </p>

                                    {stat.hint && (
                                        <div className="mt-2 flex items-center gap-1 text-[11px] text-[#666666] group-hover:text-[#111111]">
                                            <span>{stat.hint}</span>
                                            <ArrowRight size={11} className="transition group-hover:translate-x-0.5" />
                                        </div>
                                    )}
                                </button>
                            );
                        }

                        return (
                            <div
                                key={stat.label}
                                className="rounded-md border border-[#E5E5E5] bg-white p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-[#666666]">
                                        {stat.label}
                                    </span>
                                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                        <Icon size={14} />
                                    </div>
                                </div>

                                <p className="mt-3 text-2xl font-bold tracking-tight text-[#111111]">
                                    {stat.value}
                                </p>
                                <p className="mt-2 text-[11px] text-[#999999]">Standard metadata</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Section D: Column overview */}
            <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#666666]">
                    Dataset Column Structure
                </h3>
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Numeric Columns */}
                    <div className="rounded-md border border-[#E5E5E5] bg-white p-4">
                        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
                            <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                    <Hash size={13} />
                                </div>
                                <h4 className="text-xs font-semibold text-[#111111]">
                                    Numeric Columns
                                </h4>
                            </div>
                            <span className="rounded bg-[#F7F7F7] px-1.5 py-0.5 text-[11px] font-semibold text-[#111111]">
                                {profile.numeric_columns.length}
                            </span>
                        </div>

                        <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto pr-1">
                            {profile.numeric_columns.length > 0 ? (
                                profile.numeric_columns.map((column) => (
                                    <div
                                        key={column}
                                        className="rounded-md border border-[#E5E5E5] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#111111]"
                                    >
                                        {column}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-[#999999]">
                                    No numeric columns detected.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Categorical Columns */}
                    <div className="rounded-md border border-[#E5E5E5] bg-white p-4">
                        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
                            <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                    <Table2 size={13} />
                                </div>
                                <h4 className="text-xs font-semibold text-[#111111]">
                                    Categorical Columns
                                </h4>
                            </div>
                            <span className="rounded bg-[#F7F7F7] px-1.5 py-0.5 text-[11px] font-semibold text-[#111111]">
                                {profile.categorical_columns.length}
                            </span>
                        </div>

                        <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto pr-1">
                            {profile.categorical_columns.length > 0 ? (
                                profile.categorical_columns.map((column) => (
                                    <div
                                        key={column}
                                        className="rounded-md border border-[#E5E5E5] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#111111]"
                                    >
                                        {column}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-[#999999]">
                                    No categorical columns detected.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Date Columns */}
                    <div className="rounded-md border border-[#E5E5E5] bg-white p-4">
                        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
                            <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                    <Calendar size={13} />
                                </div>
                                <h4 className="text-xs font-semibold text-[#111111]">
                                    Date Columns
                                </h4>
                            </div>
                            <span className="rounded bg-[#F7F7F7] px-1.5 py-0.5 text-[11px] font-semibold text-[#111111]">
                                {profile.date_columns.length}
                            </span>
                        </div>

                        <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto pr-1">
                            {profile.date_columns.length > 0 ? (
                                profile.date_columns.map((column) => (
                                    <div
                                        key={column}
                                        className="rounded-md border border-[#E5E5E5] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#111111]"
                                    >
                                        {column}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-[#999999]">
                                    No date columns detected.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Missing Values Details */}
            {missingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-md border border-[#E5E5E5] bg-white shadow-xl flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                    <AlertCircle size={15} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#111111]">
                                        Missing Value Breakdown
                                    </h3>
                                    <p className="text-xs text-[#666666]">
                                        Cell-level missing diagnostics computed from dataset
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMissingModalOpen(false)}
                                className="rounded p-1 text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-5 space-y-4">
                            {loadingMissing ? (
                                <div className="py-12 text-center">
                                    <Loader2 size={24} className="mx-auto animate-spin text-[#111111]" />
                                    <p className="mt-2 text-xs text-[#666666]">Inspecting missing cells...</p>
                                </div>
                            ) : missingData ? (
                                <>
                                    {/* Summary strip */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-3">
                                            <span className="text-[11px] text-[#666666]">Total Missing Cells</span>
                                            <p className="text-lg font-bold text-[#111111]">
                                                {missingData.total_missing.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-3">
                                            <span className="text-[11px] text-[#666666]">Affected Rows</span>
                                            <p className="text-lg font-bold text-[#111111]">
                                                {missingData.affected_rows.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-3">
                                            <span className="text-[11px] text-[#666666]">Completeness Rate</span>
                                            <p className="text-lg font-bold text-[#111111]">
                                                {profile.rows > 0 && profile.columns > 0
                                                    ? `${(
                                                          (1 - missingData.total_missing / (profile.rows * profile.columns)) *
                                                          100
                                                      ).toFixed(1)}%`
                                                    : "100%"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Column breakdown table */}
                                    <div>
                                        <h4 className="mb-2 text-xs font-semibold text-[#111111]">
                                            Column-by-Column Missing Count
                                        </h4>
                                        <div className="max-h-48 overflow-y-auto rounded-md border border-[#E5E5E5]">
                                            <table className="w-full text-left text-xs">
                                                <thead className="sticky top-0 border-b border-[#E5E5E5] bg-[#F7F7F7] text-[11px] font-semibold text-[#666666]">
                                                    <tr>
                                                        <th className="px-3 py-2">Column</th>
                                                        <th className="px-3 py-2 text-right">Missing Cells</th>
                                                        <th className="px-3 py-2 text-right">Missing %</th>
                                                        <th className="px-3 py-2 text-center">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#E5E5E5]">
                                                    {missingData.missing_summary.map((col) => (
                                                        <tr key={col.column} className="hover:bg-[#F7F7F7]">
                                                            <td className="px-3 py-2 font-medium text-[#111111]">
                                                                {col.column}
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-mono text-[#111111]">
                                                                {col.missing_count.toLocaleString()}
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-mono text-[#111111]">
                                                                {col.missing_pct}%
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                {col.missing_count === 0 ? (
                                                                    <span className="inline-flex items-center gap-1 text-[11px] text-[#16a34a]">
                                                                        <CheckCircle2 size={12} />
                                                                        Complete
                                                                    </span>
                                                                ) : (
                                                                    <span className="rounded bg-[#FFF7ED] px-1.5 py-0.5 text-[10px] font-medium text-[#ea580c]">
                                                                        Missing values
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Specific missing cell sample locations */}
                                    {missingData.missing_details.length > 0 && (
                                        <div>
                                            <h4 className="mb-2 text-xs font-semibold text-[#111111]">
                                                Exact Missing Cell Locations (Sample of {missingData.missing_details.length})
                                            </h4>
                                            <div className="max-h-48 overflow-y-auto rounded-md border border-[#E5E5E5]">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="sticky top-0 border-b border-[#E5E5E5] bg-[#F7F7F7] text-[11px] font-semibold text-[#666666]">
                                                        <tr>
                                                            <th className="px-3 py-2">CSV Row #</th>
                                                            <th className="px-3 py-2">Column Name</th>
                                                            <th className="px-3 py-2 text-right">Index</th>
                                                            <th className="px-3 py-2 text-center">Value Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#E5E5E5]">
                                                        {missingData.missing_details.map((m, idx) => (
                                                            <tr key={idx} className="hover:bg-[#F7F7F7]">
                                                                <td className="px-3 py-2 font-mono text-[#111111]">
                                                                    Row {m.row_number}
                                                                </td>
                                                                <td className="px-3 py-2 font-medium text-[#111111]">
                                                                    {m.column_name}
                                                                </td>
                                                                <td className="px-3 py-2 text-right font-mono text-[#666666]">
                                                                    {m.dataframe_index}
                                                                </td>
                                                                <td className="px-3 py-2 text-center">
                                                                    <span className="rounded border border-[#E5E5E5] bg-[#FAFAFA] px-2 py-0.5 font-mono text-[10px] text-[#ea580c]">
                                                                        Missing (NaN/Empty)
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-xs text-[#666666]">Unable to load missing value details.</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-[#E5E5E5] px-5 py-3 flex justify-end bg-[#FAFAFA]">
                            <button
                                type="button"
                                onClick={() => setMissingModalOpen(false)}
                                className="rounded-md border border-[#E5E5E5] bg-white px-3.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#F7F7F7]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Duplicate Rows Details */}
            {dupModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-md border border-[#E5E5E5] bg-white shadow-xl flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                    <Copy size={15} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#111111]">
                                        Duplicate Record Details
                                    </h3>
                                    <p className="text-xs text-[#666666]">
                                        Identified identical records across dataset rows
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDupModalOpen(false)}
                                className="rounded p-1 text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-5 space-y-4">
                            {loadingDup ? (
                                <div className="py-12 text-center">
                                    <Loader2 size={24} className="mx-auto animate-spin text-[#111111]" />
                                    <p className="mt-2 text-xs text-[#666666]">Checking duplicate records...</p>
                                </div>
                            ) : dupData ? (
                                <>
                                    {/* Summary strip */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-3">
                                            <span className="text-[11px] text-[#666666]">Duplicate Rows</span>
                                            <p className="text-lg font-bold text-[#111111]">
                                                {dupData.duplicate_count.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-3">
                                            <span className="text-[11px] text-[#666666]">Total Rows</span>
                                            <p className="text-lg font-bold text-[#111111]">
                                                {dupData.total_rows.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-3">
                                            <span className="text-[11px] text-[#666666]">Duplicate Rate</span>
                                            <p className="text-lg font-bold text-[#111111]">
                                                {dupData.duplicate_percentage}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Duplicate rows sample table */}
                                    {dupData.duplicate_count > 0 ? (
                                        <div>
                                            <h4 className="mb-2 text-xs font-semibold text-[#111111]">
                                                Sample Duplicate Records Found
                                            </h4>
                                            <div className="max-h-60 overflow-x-auto rounded-md border border-[#E5E5E5]">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="sticky top-0 border-b border-[#E5E5E5] bg-[#F7F7F7] text-[11px] font-semibold text-[#666666]">
                                                        <tr>
                                                            <th className="px-3 py-2 font-mono">Row #</th>
                                                            {dupData.columns.map((col) => (
                                                                <th key={col} className="px-3 py-2 whitespace-nowrap">
                                                                    {col}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#E5E5E5]">
                                                        {dupData.sample_rows.map((row, idx) => (
                                                            <tr key={idx} className="hover:bg-[#F7F7F7]">
                                                                <td className="px-3 py-2 font-mono text-[#999999]">
                                                                    Row {String(row._csv_row)}
                                                                </td>
                                                                {dupData.columns.map((col) => (
                                                                    <td
                                                                        key={col}
                                                                        className="px-3 py-2 font-mono text-[#111111] whitespace-nowrap"
                                                                    >
                                                                        {row[col] !== undefined ? String(row[col]) : "-"}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <CheckCircle2 size={24} className="mx-auto text-[#16a34a]" />
                                            <h4 className="mt-2 text-sm font-semibold text-[#111111]">
                                                No duplicate records detected
                                            </h4>
                                            <p className="mt-1 text-xs text-[#666666]">
                                                Every row across this dataset is completely unique.
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-xs text-[#666666]">Unable to load duplicate record details.</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-[#E5E5E5] px-5 py-3 flex justify-end bg-[#FAFAFA]">
                            <button
                                type="button"
                                onClick={() => setDupModalOpen(false)}
                                className="rounded-md border border-[#E5E5E5] bg-white px-3.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#F7F7F7]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}