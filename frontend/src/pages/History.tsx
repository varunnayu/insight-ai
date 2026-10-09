import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    History as HistoryIcon,
    Loader2,
    Upload,
    CheckCircle2,
    FileSpreadsheet,
    ArrowLeft,
    Calendar,
    HardDrive,
    Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import { useDataset } from "../context/DatasetContext";
import { getDatasetHistory, type HistoryItem } from "../services/api";

function formatFileSize(bytes?: number): string {
    if (!bytes || bytes <= 0) return "N/A";
    if (bytes >= 1_048_576) {
        return `${(bytes / 1_048_576).toFixed(1)} MB`;
    }
    if (bytes >= 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${bytes} B`;
}

export default function History() {
    const navigate = useNavigate();
    const { activateDatasetById, deleteDatasetById, setUploadModalOpen } = useDataset();

    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activatingId, setActivatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadHistory = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getDatasetHistory();
            if (res.success) {
                setHistory(res.history);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to load history";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleDisplay = async (item: HistoryItem) => {
        try {
            setActivatingId(item.id);
            const success = await activateDatasetById(item.id);
            if (success) {
                navigate("/dashboard");
            }
        } finally {
            setActivatingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id);
            const success = await deleteDatasetById(id);
            if (success) {
                setHistory((prev) => prev.filter((item) => item.id !== id));
            }
        } finally {
            setDeletingId(null);
        }
    };

    const handleCancel = () => {
        // Returns to the previous view
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Page Header */}
            <section className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] pb-5 sm:flex-row sm:items-end">
                <div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="rounded-md border border-[#E5E5E5] bg-white p-1.5 text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]"
                            title="Return to previous view"
                        >
                            <ArrowLeft size={14} />
                        </button>
                        <h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
                            Dataset History
                        </h1>
                    </div>
                    <p className="mt-1 text-xs text-[#666666] sm:text-sm">
                        Inspect and activate previously stored datasets persisted across server restarts.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-md border border-[#E5E5E5] bg-white px-3.5 py-2 text-xs font-medium text-[#666666] transition hover:bg-[#F7F7F7] hover:text-[#111111]"
                    >
                        Back to Overview
                    </button>
                    <button
                        type="button"
                        onClick={() => setUploadModalOpen(true)}
                        className="rounded-md border border-[#111111] bg-[#111111] px-3.5 py-2 text-xs font-medium text-white transition hover:bg-black"
                    >
                        Upload Dataset
                    </button>
                </div>
            </section>

            {/* Loading State */}
            {loading && (
                <div className="flex min-h-[300px] items-center justify-center rounded-md border border-[#E5E5E5] bg-white py-16">
                    <div className="text-center">
                        <Loader2 size={28} className="mx-auto animate-spin text-[#111111]" />
                        <p className="mt-3 text-xs font-semibold text-[#111111]">
                            Loading dataset history...
                        </p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && history.length === 0 && (
                <section className="rounded-md border border-dashed border-[#E5E5E5] bg-white p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <HistoryIcon size={20} />
                    </div>

                    <h2 className="mt-4 text-base font-semibold text-[#111111]">
                        No dataset history found
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#666666]">
                        Datasets uploaded to InsightAI will automatically be persisted to disk storage and listed here.
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
            )}

            {/* History Table & Cards */}
            {!loading && history.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#666666]">
                            Total saved datasets: <strong className="text-[#111111]">{history.length}</strong>
                        </span>
                        <span className="text-[11px] text-[#999999]">
                            Persisted in backend storage
                        </span>
                    </div>

                    <div className="overflow-hidden rounded-md border border-[#E5E5E5] bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[11px] font-semibold uppercase text-[#666666]">
                                    <tr>
                                        <th className="px-4 py-3">Dataset File</th>
                                        <th className="px-4 py-3">Upload Date & Time</th>
                                        <th className="px-4 py-3 text-right">Rows</th>
                                        <th className="px-4 py-3 text-right">Columns</th>
                                        <th className="px-4 py-3 text-right">File Size</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E5E5]">
                                    {history.map((item) => {
                                        const isActivating = activatingId === item.id;

                                        return (
                                            <tr
                                                key={item.id}
                                                className={`transition hover:bg-[#F7F7F7] ${
                                                    item.is_active ? "bg-[#FAFAFA]" : ""
                                                }`}
                                            >
                                                {/* Filename & ID */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                                            <FileSpreadsheet size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-[#111111]">
                                                                {item.filename}
                                                            </p>
                                                            <p className="font-mono text-[10px] text-[#999999]">
                                                                ID: {item.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Upload timestamp */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-[#666666]">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={12} className="text-[#999999]" />
                                                        <span>{item.uploaded_at}</span>
                                                    </div>
                                                </td>

                                                {/* Row count */}
                                                <td className="px-4 py-3.5 text-right font-mono text-[#111111]">
                                                    {item.rows.toLocaleString()}
                                                </td>

                                                {/* Column count */}
                                                <td className="px-4 py-3.5 text-right font-mono text-[#111111]">
                                                    {item.columns}
                                                </td>

                                                {/* File size */}
                                                <td className="px-4 py-3.5 text-right font-mono text-[#666666]">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <HardDrive size={11} className="text-[#999999]" />
                                                        <span>{formatFileSize(item.file_size)}</span>
                                                    </div>
                                                </td>

                                                {/* Active Dataset Indicator */}
                                                <td className="px-4 py-3.5 text-center">
                                                    {item.is_active ? (
                                                        <span className="inline-flex items-center gap-1 rounded-md border border-[#16a34a] bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-semibold text-[#16a34a]">
                                                            <CheckCircle2 size={12} />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-[#999999]">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions: DISPLAY & CANCEL */}
                                                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* DISPLAY BUTTON */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDisplay(item)}
                                                            disabled={isActivating}
                                                            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                                                item.is_active
                                                                    ? "border border-[#111111] bg-[#111111] text-white hover:bg-black"
                                                                    : "border border-[#2563eb] bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
                                                            }`}
                                                            title={
                                                                item.is_active
                                                                    ? "Active dataset. Click to view on Dashboard."
                                                                    : "Activate this saved dataset across the application."
                                                            }
                                                        >
                                                            {isActivating ? (
                                                                <>
                                                                    <Loader2 size={12} className="animate-spin" />
                                                                    <span>Activating...</span>
                                                                </>
                                                            ) : (
                                                                <span>DISPLAY</span>
                                                            )}
                                                        </button>

                                                        {/* DELETE BUTTON */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item.id)}
                                                            disabled={deletingId === item.id || isActivating}
                                                            className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1.5 text-xs font-medium text-[#666666] transition hover:border-[#dc2626] hover:bg-[#FEF2F2] hover:text-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50"
                                                            title="Delete this dataset from history"
                                                        >
                                                            {deletingId === item.id ? (
                                                                <>
                                                                    <Loader2 size={12} className="animate-spin text-[#dc2626]" />
                                                                    <span>Deleting...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Trash2 size={12} />
                                                                    <span>Delete</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
