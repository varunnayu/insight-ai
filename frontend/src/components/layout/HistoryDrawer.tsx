import { useEffect, useState, useCallback, useMemo } from "react";
import {
    X,
    Search,
    Calendar,
    HardDrive,
    CheckCircle2,
    FileSpreadsheet,
    Loader2,
    Upload,
    History as HistoryIcon,
    Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import { useDataset } from "../../context/DatasetContext";
import { getDatasetHistory, type HistoryItem } from "../../services/api";

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

interface HistoryDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function HistoryDrawer({ open, onClose }: HistoryDrawerProps) {
    const {
        dataset,
        activateDatasetById,
        deleteDatasetById,
        setUploadModalOpen,
    } = useDataset();

    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [activatingId, setActivatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch history whenever the panel opens
    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getDatasetHistory();
            if (res.success) {
                setHistory(res.history);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to load dataset history";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            fetchHistory();
            setSearchQuery("");
        }
    }, [open, fetchHistory]);

    // Close on Escape key press
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    // Handle DISPLAY action (activates dataset and refreshes the application)
    const handleDisplay = async (item: HistoryItem) => {
        try {
            setActivatingId(item.id);
            const success = await activateDatasetById(item.id);
            if (success) {
                onClose();
            }
        } finally {
            setActivatingId(null);
        }
    };

    // Handle DELETE action (removes dataset from disk storage and page)
    const handleDelete = async (item: HistoryItem) => {
        try {
            setDeletingId(item.id);
            const success = await deleteDatasetById(item.id);
            if (success) {
                // Immediately remove from current drawer list
                setHistory((prev) => prev.filter((h) => h.id !== item.id));
            }
        } finally {
            setDeletingId(null);
        }
    };

    // Filtered dataset list based on search query
    const filteredHistory = useMemo(() => {
        if (!searchQuery.trim()) return history;
        const q = searchQuery.toLowerCase().trim();
        return history.filter(
            (item) =>
                item.filename.toLowerCase().includes(q) ||
                item.id.toLowerCase().includes(q)
        );
    }, [history, searchQuery]);

    if (!open) return null;

    const isBusy = loading || activatingId !== null || deletingId !== null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop overlay */}
            <div
                className="fixed inset-0 bg-black/40 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-out panel container */}
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <aside
                    aria-label="Dataset History Panel"
                    className="flex w-screen max-w-md flex-col border-l border-[#E5E5E5] bg-white shadow-2xl transition-transform"
                >
                    {/* Top Animated Loading Bar */}
                    <div className="relative h-[3px] w-full overflow-hidden bg-[#F0F0F0]">
                        {isBusy && (
                            <div className="absolute inset-y-0 h-full bg-[#111111] animate-indeterminate-progress" />
                        )}
                    </div>

                    {/* Header */}
                    <div className="border-b border-[#E5E5E5] p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                    <HistoryIcon size={14} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-[#111111]">
                                        Dataset History
                                    </h2>
                                    <p className="text-xs text-[#666666]">
                                        Persisted uploads available for instant activation
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md border border-[#E5E5E5] p-1.5 text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]"
                                title="Close panel (Escape)"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative mt-4">
                            <Search
                                size={13}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]"
                            />
                            <input
                                type="text"
                                placeholder="Search saved datasets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-md border border-[#E5E5E5] bg-white py-1.5 pl-8 pr-7 text-xs text-[#111111] placeholder-[#999999] focus:border-[#111111] focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#111111]"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        {/* Active summary label */}
                        {dataset && (
                            <div className="mt-3 flex items-center justify-between rounded-md border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2 text-[11px]">
                                <span className="text-[#666666]">Current Active:</span>
                                <strong className="max-w-[200px] truncate text-[#111111]">
                                    {dataset.filename}
                                </strong>
                            </div>
                        )}
                    </div>

                    {/* Independently Scrollable Dataset List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loading && history.length === 0 ? (
                            <div className="flex h-48 flex-col items-center justify-center text-center">
                                <Loader2 size={24} className="animate-spin text-[#111111]" />
                                <p className="mt-3 text-xs text-[#666666]">
                                    Loading persisted dataset history...
                                </p>
                            </div>
                        ) : filteredHistory.length === 0 ? (
                            <div className="rounded-md border border-dashed border-[#E5E5E5] p-8 text-center">
                                <HistoryIcon size={22} className="mx-auto text-[#999999]" />
                                <h3 className="mt-3 text-xs font-semibold text-[#111111]">
                                    {searchQuery ? "No matching datasets" : "No dataset history"}
                                </h3>
                                <p className="mt-1 text-[11px] text-[#666666]">
                                    {searchQuery
                                        ? `No saved files match "${searchQuery}".`
                                        : "Datasets uploaded will automatically be saved to disk here."}
                                </p>

                                {searchQuery ? (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="mt-3 text-xs font-semibold text-[#2563eb] hover:underline"
                                    >
                                        Clear search
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            setUploadModalOpen(true);
                                        }}
                                        className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-[#111111] bg-[#111111] px-3 py-1.5 text-xs font-medium text-white hover:bg-black"
                                    >
                                        <Upload size={12} />
                                        <span>Upload Dataset</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredHistory.map((item) => {
                                const isActivating = activatingId === item.id;
                                const isActive = item.is_active || dataset?.filename === item.filename;

                                return (
                                    <div
                                        key={item.id}
                                        className={`rounded-md border p-3.5 transition ${
                                            isActive
                                                ? "border-[#111111] bg-[#FAFAFA]"
                                                : "border-[#E5E5E5] bg-white hover:border-[#CCCCCC]"
                                        }`}
                                    >
                                        {/* Card Title Strip */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-2.5 min-w-0">
                                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#E5E5E5] bg-white text-[#111111]">
                                                    <FileSpreadsheet size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p
                                                        className="truncate text-xs font-bold text-[#111111]"
                                                        title={item.filename}
                                                    >
                                                        {item.filename}
                                                    </p>
                                                    <p className="font-mono text-[10px] text-[#999999]">
                                                        ID: {item.id}
                                                    </p>
                                                </div>
                                            </div>

                                            {isActive && (
                                                <span className="inline-flex shrink-0 items-center gap-1 rounded border border-[#16a34a] bg-[#F0FDF4] px-1.5 py-0.5 text-[10px] font-semibold text-[#16a34a]">
                                                    <CheckCircle2 size={10} />
                                                    Active
                                                </span>
                                            )}
                                        </div>

                                        {/* Metadata Details */}
                                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#E5E5E5] pt-2.5 text-[11px]">
                                            <div className="text-[#666666]">
                                                <span>Rows:</span>{" "}
                                                <strong className="font-mono text-[#111111]">
                                                    {item.rows.toLocaleString()}
                                                </strong>
                                            </div>

                                            <div className="text-[#666666]">
                                                <span>Cols:</span>{" "}
                                                <strong className="font-mono text-[#111111]">
                                                    {item.columns}
                                                </strong>
                                            </div>

                                            <div className="flex items-center gap-1 text-[#666666] col-span-2">
                                                <Calendar size={11} className="text-[#999999]" />
                                                <span>{item.uploaded_at}</span>
                                            </div>

                                            <div className="flex items-center gap-1 text-[#666666] col-span-2">
                                                <HardDrive size={11} className="text-[#999999]" />
                                                <span>Size: {formatFileSize(item.file_size)}</span>
                                            </div>
                                        </div>

                                        {/* Actions: DISPLAY & CANCEL */}
                                        <div className="mt-3.5 flex items-center justify-end gap-2 border-t border-[#E5E5E5] pt-2.5">
                                            {/* DISPLAY BUTTON */}
                                            <button
                                                type="button"
                                                onClick={() => handleDisplay(item)}
                                                disabled={isBusy}
                                                className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                    isActive
                                                        ? "border border-[#111111] bg-[#111111] text-white hover:bg-black"
                                                        : "border border-[#2563eb] bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
                                                }`}
                                                title={
                                                    isActive
                                                        ? "Dataset currently active in app"
                                                        : "Activate this saved dataset across all dashboard analytics"
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
                                                onClick={() => handleDelete(item)}
                                                disabled={isBusy}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1.5 text-xs font-medium text-[#666666] transition hover:border-[#dc2626] hover:bg-[#FEF2F2] hover:text-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50"
                                                title="Delete this dataset and remove it from history"
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
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-[#E5E5E5] bg-[#FAFAFA] p-4 flex items-center justify-between">
                        <span className="text-[11px] text-[#666666]">
                            Total saved: <strong className="text-[#111111]">{history.length}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    setUploadModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#F7F7F7]"
                            >
                                <Upload size={12} />
                                <span>Upload New</span>
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md border border-[#111111] bg-[#111111] px-3 py-1.5 text-xs font-medium text-white hover:bg-black"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
