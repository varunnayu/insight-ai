import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Table as TableIcon,
    Search,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    SlidersHorizontal,
    Loader2,
    X,
} from "lucide-react";
import { getDatasetPreview } from "../../services/api";

interface DatasetPreviewTableProps {
    rows?: Array<Record<string, string | number>>;
    columns?: string[];
    totalRows?: number;
    filename?: string;
}

export default function DatasetPreviewTable({
    rows: initialRows = [],
    columns: initialColumns = [],
    totalRows: initialTotalRows = 0,
    filename,
}: DatasetPreviewTableProps) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortCol, setSortCol] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const [tableRows, setTableRows] = useState<Array<Record<string, string | number>>>(initialRows);
    const [allColumns, setAllColumns] = useState<string[]>(initialColumns);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(initialColumns);
    const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);

    const [filteredCount, setFilteredCount] = useState(initialTotalRows);
    const [totalPages, setTotalPages] = useState(Math.max(1, Math.ceil(initialTotalRows / pageSize)));
    const [isLoading, setIsLoading] = useState(false);

    // Debounce search input by 250ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 250);
        return () => clearTimeout(timer);
    }, [search]);

    // Update columns when initialColumns changes
    useEffect(() => {
        if (initialColumns && initialColumns.length > 0) {
            setAllColumns(initialColumns);
            if (selectedColumns.length === 0) {
                setSelectedColumns(initialColumns);
            }
        }
    }, [initialColumns]);

    // Fetch from backend preview endpoint
    const fetchPreview = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getDatasetPreview({
                page,
                page_size: pageSize,
                search: debouncedSearch,
                sort_col: sortCol,
                sort_order: sortOrder,
            });

            if (data.success) {
                setTableRows(data.rows);
                if (data.columns && data.columns.length > 0) {
                    setAllColumns(data.columns);
                    if (selectedColumns.length === 0) {
                        setSelectedColumns(data.columns);
                    }
                }
                setFilteredCount(data.filtered_rows);
                setTotalPages(data.total_pages);
            }
        } catch {
            // Fallback to local filtering of initialRows if API fails
            let filtered = [...initialRows];
            if (debouncedSearch.trim()) {
                const s = debouncedSearch.toLowerCase();
                filtered = filtered.filter((r) =>
                    Object.values(r).some((v) => String(v).toLowerCase().includes(s))
                );
            }
            if (sortCol) {
                filtered.sort((a, b) => {
                    const valA = a[sortCol];
                    const valB = b[sortCol];
                    if (valA === valB) return 0;
                    if (valA === undefined || valA === null) return 1;
                    if (valB === undefined || valB === null) return -1;
                    if (typeof valA === "number" && typeof valB === "number") {
                        return sortOrder === "asc" ? valA - valB : valB - valA;
                    }
                    const strA = String(valA);
                    const strB = String(valB);
                    return sortOrder === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
                });
            }
            setFilteredCount(filtered.length);
            const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
            setTotalPages(pages);
            const start = (page - 1) * pageSize;
            setTableRows(filtered.slice(start, start + pageSize));
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, debouncedSearch, sortCol, sortOrder, initialRows, selectedColumns.length]);

    useEffect(() => {
        fetchPreview();
    }, [fetchPreview]);

    const handleSort = (col: string) => {
        if (sortCol === col) {
            if (sortOrder === "asc") {
                setSortOrder("desc");
            } else {
                setSortCol("");
                setSortOrder("asc");
            }
        } else {
            setSortCol(col);
            setSortOrder("asc");
        }
        setPage(1);
    };

    const toggleColumn = (col: string) => {
        if (selectedColumns.includes(col)) {
            if (selectedColumns.length > 1) {
                setSelectedColumns(selectedColumns.filter((c) => c !== col));
            }
        } else {
            setSelectedColumns([...selectedColumns, col]);
        }
    };

    const selectAllColumns = () => setSelectedColumns(allColumns);
    const resetColumns = () => setSelectedColumns(allColumns.slice(0, Math.min(8, allColumns.length)));

    // Visible columns in order
    const visibleColumns = useMemo(
        () => allColumns.filter((c) => selectedColumns.includes(c)),
        [allColumns, selectedColumns]
    );

    const startRecord = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1;
    const endRecord = Math.min(page * pageSize, filteredCount);

    return (
        <section id="raw-data-preview" className="space-y-3.5 rounded-md border border-[#E5E5E5] bg-white p-5">
            {/* Header & Controls Strip */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                        <TableIcon size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-[#111111]">
                            Raw Dataset Preview
                        </h2>
                        <p className="text-xs text-[#666666]">
                            {filename ? `${filename} &bull; ` : ""}
                            Showing {startRecord.toLocaleString()}–{endRecord.toLocaleString()} of{" "}
                            {filteredCount.toLocaleString()} {debouncedSearch ? "filtered" : "total"} records
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Search Input */}
                    <div className="relative">
                        <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999999]"
                        />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-48 rounded-md border border-[#E5E5E5] bg-white py-1.5 pl-7 pr-7 text-xs text-[#111111] placeholder-[#999999] focus:border-[#111111] focus:outline-none"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#111111]"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Column Selection Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setColumnDropdownOpen(!columnDropdownOpen)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#F7F7F7]"
                        >
                            <SlidersHorizontal size={12} />
                            <span>Columns ({visibleColumns.length}/{allColumns.length})</span>
                        </button>

                        {columnDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-30"
                                    onClick={() => setColumnDropdownOpen(false)}
                                />
                                <div className="absolute right-0 z-40 mt-1 max-h-72 w-56 overflow-y-auto rounded-md border border-[#E5E5E5] bg-white p-2 shadow-md">
                                    <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-1.5 px-1 text-[11px] font-semibold text-[#666666]">
                                        <span>Toggle Columns</span>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={selectAllColumns}
                                                className="text-[#2563eb] hover:underline"
                                            >
                                                All
                                            </button>
                                            <button
                                                type="button"
                                                onClick={resetColumns}
                                                className="text-[#666666] hover:underline"
                                            >
                                                Default
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-1 space-y-1">
                                        {allColumns.map((col) => {
                                            const isChecked = selectedColumns.includes(col);
                                            return (
                                                <label
                                                    key={col}
                                                    className="flex cursor-pointer items-center justify-between rounded px-2 py-1 text-xs hover:bg-[#F7F7F7]"
                                                >
                                                    <span className="truncate pr-2 text-[#111111]">{col}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleColumn(col)}
                                                        className="h-3.5 w-3.5 rounded border-[#E5E5E5] text-[#111111] focus:ring-0"
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Page Size Selector */}
                    <div className="flex items-center gap-1 text-xs text-[#666666]">
                        <span className="hidden sm:inline">Rows:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPage(1);
                            }}
                            className="rounded-md border border-[#E5E5E5] bg-white px-2 py-1.5 text-xs text-[#111111] focus:outline-none"
                        >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="relative overflow-hidden rounded-md border border-[#E5E5E5]">
                {isLoading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                        <Loader2 size={20} className="animate-spin text-[#111111]" />
                    </div>
                )}

                <div className="max-h-[440px] overflow-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 z-10 border-b border-[#E5E5E5] bg-[#F7F7F7] text-[11px] font-semibold text-[#666666]">
                            <tr>
                                <th className="px-3 py-2 font-mono text-[#999999] w-12 text-center">#</th>
                                {visibleColumns.map((col) => {
                                    const isSorted = sortCol === col;
                                    return (
                                        <th
                                            key={col}
                                            onClick={() => handleSort(col)}
                                            className="cursor-pointer px-3 py-2 whitespace-nowrap transition select-none hover:bg-[#EFEFEF] hover:text-[#111111]"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span>{col}</span>
                                                {isSorted ? (
                                                    sortOrder === "asc" ? (
                                                        <ArrowUp size={11} className="text-[#2563eb]" />
                                                    ) : (
                                                        <ArrowDown size={11} className="text-[#2563eb]" />
                                                    )
                                                ) : (
                                                    <ArrowUpDown size={11} className="text-[#BBBBBB]" />
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#E5E5E5] bg-white">
                            {tableRows.length > 0 ? (
                                tableRows.map((row, idx) => {
                                    const rowNumber = (page - 1) * pageSize + idx + 1;
                                    return (
                                        <tr key={idx} className="transition hover:bg-[#F7F7F7]">
                                            <td className="px-3 py-2 text-center font-mono text-[11px] text-[#999999]">
                                                {rowNumber}
                                            </td>
                                            {visibleColumns.map((col) => (
                                                <td
                                                    key={col}
                                                    className="px-3 py-2 font-mono text-[11px] text-[#111111] whitespace-nowrap max-w-xs truncate"
                                                    title={row[col] !== undefined ? String(row[col]) : "-"}
                                                >
                                                    {row[col] !== undefined && row[col] !== null && row[col] !== ""
                                                        ? String(row[col])
                                                        : "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={visibleColumns.length + 1}
                                        className="py-12 text-center text-xs text-[#666666]"
                                    >
                                        {debouncedSearch ? (
                                            <div className="space-y-1">
                                                <p className="font-medium text-[#111111]">No matching records found</p>
                                                <p className="text-[#999999]">No rows matched your search term "{debouncedSearch}".</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setSearch("")}
                                                    className="mt-2 text-xs font-semibold text-[#2563eb] hover:underline"
                                                >
                                                    Clear search
                                                </button>
                                            </div>
                                        ) : (
                                            <p>No records available in this dataset.</p>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls Footer */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <span className="text-xs text-[#666666]">
                    Showing <strong className="text-[#111111]">{startRecord.toLocaleString()}</strong> to{" "}
                    <strong className="text-[#111111]">{endRecord.toLocaleString()}</strong> of{" "}
                    <strong className="text-[#111111]">{filteredCount.toLocaleString()}</strong> records
                </span>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1 || isLoading}
                        className="inline-flex items-center gap-1 rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1.5 text-xs font-medium text-[#111111] transition hover:bg-[#F7F7F7] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft size={13} />
                        <span>Previous</span>
                    </button>

                    <span className="px-2 text-xs font-medium text-[#111111]">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || isLoading}
                        className="inline-flex items-center gap-1 rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1.5 text-xs font-medium text-[#111111] transition hover:bg-[#F7F7F7] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span>Next</span>
                        <ChevronRight size={13} />
                    </button>
                </div>
            </div>
        </section>
    );
}
