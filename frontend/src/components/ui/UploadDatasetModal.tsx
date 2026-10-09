import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

import {
    FileSpreadsheet,
    Upload,
    X,
    Loader2,
} from "lucide-react";

import { uploadDataset } from "../../services/api";

interface UploadDatasetModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (data: Awaited<ReturnType<typeof uploadDataset>>) => void;
}

export default function UploadDatasetModal({
    open,
    onClose,
    onSuccess,
}: UploadDatasetModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!open) {
        return null;
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a CSV or Excel file.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const result = await uploadDataset(selectedFile);

            onSuccess(result);
            onClose();

            setSelectedFile(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-md border border-[#E5E5E5] bg-white p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#E5E5E5] pb-4">
                    <div>
                        <h2 className="text-base font-bold text-[#111111]">
                            Upload Dataset
                        </h2>

                        <p className="mt-0.5 text-xs text-[#666666]">
                            Upload a structured CSV or Excel file for automated intelligence analysis.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Drop Zone */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-5 flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-[#E5E5E5] bg-[#FAFAFA] px-6 py-10 transition hover:border-[#111111] hover:bg-white"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[#E5E5E5] bg-white shadow-sm">
                        <Upload className="text-[#111111]" size={18} />
                    </div>

                    <p className="mt-3 text-xs font-semibold text-[#111111]">
                        Click to select a dataset file
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#999999]">
                        Supported formats: .csv, .xlsx, .xls
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </button>

                {/* Selected File */}
                {selectedFile && (
                    <div className="mt-3 flex items-center gap-3 rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E5E5] bg-white text-[#111111]">
                            <FileSpreadsheet size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-[#111111]">
                                {selectedFile.name}
                            </p>

                            <p className="text-[11px] text-[#666666]">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mt-3 rounded-md border border-[#ea580c] bg-[#FFF7ED] px-3 py-2 text-xs font-medium text-[#ea580c]">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex justify-end gap-2 border-t border-[#E5E5E5] pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-[#E5E5E5] bg-white px-4 py-2 text-xs font-medium text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!selectedFile || loading}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#111111] bg-[#111111] px-4 py-2 text-xs font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <span>Analyze Dataset</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}