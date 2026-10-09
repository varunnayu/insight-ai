import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import toast from "react-hot-toast";

import {
    getAnalytics,
    getReport,
    activateSavedDataset,
    deleteSavedDataset,
    type AnalyticsData,
    type ReportData,
    type UploadResponse,
} from "../services/api";

export interface DatasetContextType {
    dataset: UploadResponse | null;
    analytics: AnalyticsData | null;
    report: ReportData | null;
    loadingAnalytics: boolean;
    loadingReport: boolean;
    hasDataset: boolean;
    uploadModalOpen: boolean;
    setUploadModalOpen: (open: boolean) => void;
    historyPanelOpen: boolean;
    setHistoryPanelOpen: (open: boolean) => void;
    handleUploadSuccess: (data: UploadResponse) => Promise<void>;
    activateDatasetById: (id: string) => Promise<boolean>;
    deleteDatasetById: (id: string) => Promise<boolean>;
    refreshAnalytics: () => Promise<void>;
    refreshReport: (isRefresh?: boolean) => Promise<ReportData | null>;
    clearDataset: () => void;
}

export const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

const STORAGE_KEY = "insightai_active_dataset";

export function DatasetProvider({ children }: { children: ReactNode }) {
    const [dataset, setDataset] = useState<UploadResponse | null>(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            return saved ? (JSON.parse(saved) as UploadResponse) : null;
        } catch {
            return null;
        }
    });

    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [report, setReport] = useState<ReportData | null>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);
    const [loadingReport, setLoadingReport] = useState<boolean>(false);
    const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
    const [historyPanelOpen, setHistoryPanelOpen] = useState<boolean>(false);

    // Save dataset to sessionStorage whenever it changes
    useEffect(() => {
        try {
            if (dataset) {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
            } else {
                sessionStorage.removeItem(STORAGE_KEY);
            }
        } catch {
            // Ignore storage errors in restricted environments
        }
    }, [dataset]);

    const refreshAnalytics = useCallback(async () => {
        try {
            setLoadingAnalytics(true);
            const response = await getAnalytics();
            if (response.success) {
                setAnalytics(response.analytics);
            }
        } catch {
            // If backend has no dataset, clear analytics safely
            setAnalytics(null);
        } finally {
            setLoadingAnalytics(false);
        }
    }, []);

    const refreshReport = useCallback(
        async (isRefresh = false): Promise<ReportData | null> => {
            try {
                if (isRefresh) {
                    setLoadingReport(true);
                } else if (!report) {
                    setLoadingReport(true);
                }

                const data = await getReport();
                setReport(data);

                // If dataset was not set locally yet, sync it from report
                if (!dataset && data.dataset_info) {
                    setDataset({
                        success: true,
                        filename: data.dataset_info.name,
                        profile: {
                            rows: data.dataset_overview.rows,
                            columns: data.dataset_overview.columns,
                            missing_values: data.dataset_overview.missing_values,
                            duplicate_rows: data.dataset_overview.duplicate_rows,
                            numeric_columns: data.statistical_summary.map((s) => s.column),
                            categorical_columns: data.categorical_analysis.map((c) => c.column),
                            date_columns: data.dataset_overview.column_details
                                .filter((c) => c.detected_type === "date")
                                .map((c) => c.name),
                            column_details: data.dataset_overview.column_details,
                        },
                    });
                }

                return data;
            } catch {
                setReport(null);
                return null;
            } finally {
                setLoadingReport(false);
            }
        },
        [report, dataset],
    );

    const handleUploadSuccess = useCallback(
        async (data: UploadResponse) => {
            setDataset(data);
            setAnalytics(null);
            setReport(null);

            try {
                setLoadingAnalytics(true);
                setLoadingReport(true);

                // Fetch analytics and report in parallel for seamless experience
                const [analyticsRes, reportRes] = await Promise.allSettled([
                    getAnalytics(),
                    getReport(),
                ]);

                if (analyticsRes.status === "fulfilled" && analyticsRes.value.success) {
                    setAnalytics(analyticsRes.value.analytics);
                }

                if (reportRes.status === "fulfilled" && reportRes.value.success) {
                    setReport(reportRes.value);
                }

                toast.success("Dataset analyzed and ready across all modules!");
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Analytics failed.";
                toast.error(message);
            } finally {
                setLoadingAnalytics(false);
                setLoadingReport(false);
            }
        },
        [],
    );

    const activateDatasetById = useCallback(async (id: string): Promise<boolean> => {
        try {
            setLoadingAnalytics(true);
            setLoadingReport(true);
            const activeRes = await activateSavedDataset(id);
            setDataset(activeRes);
            setAnalytics(null);
            setReport(null);

            const [analyticsRes, reportRes] = await Promise.allSettled([
                getAnalytics(),
                getReport(),
            ]);

            if (analyticsRes.status === "fulfilled" && analyticsRes.value.success) {
                setAnalytics(analyticsRes.value.analytics);
            }
            if (reportRes.status === "fulfilled" && reportRes.value.success) {
                setReport(reportRes.value);
            }

            toast.success(`Activated dataset "${activeRes.filename}"`);
            return true;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to activate dataset";
            toast.error(message);
            return false;
        } finally {
            setLoadingAnalytics(false);
            setLoadingReport(false);
        }
    }, []);

    const clearDataset = useCallback(() => {
        setDataset(null);
        setAnalytics(null);
        setReport(null);
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch {
            // Ignore
        }
    }, []);

    const deleteDatasetById = useCallback(
        async (id: string): Promise<boolean> => {
            try {
                const res = await deleteSavedDataset(id);
                const wasActive = dataset?.id === id || dataset?.filename.includes(id);

                if (wasActive || res.activated_next) {
                    if (res.activated_next) {
                        await activateDatasetById(res.activated_next);
                    } else if (res.remaining_count === 0) {
                        clearDataset();
                    } else {
                        await refreshReport(true);
                        await refreshAnalytics();
                    }
                }

                toast.success("Dataset removed from history");
                return true;
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to delete dataset";
                toast.error(message);
                return false;
            }
        },
        [dataset, activateDatasetById, clearDataset, refreshReport, refreshAnalytics]
    );

    // Initial check: if we have a saved dataset on page load, fetch its analytics/report
    useEffect(() => {
        if (dataset && !analytics) {
            refreshAnalytics();
        }
        if (dataset && !report) {
            refreshReport();
        }
        // If no dataset in sessionStorage, check backend once to see if backend already has an active dataset
        if (!dataset) {
            getReport()
                .then((rep) => {
                    if (rep && rep.success) {
                        setReport(rep);
                        setDataset({
                            success: true,
                            filename: rep.dataset_info.name,
                            profile: {
                                rows: rep.dataset_overview.rows,
                                columns: rep.dataset_overview.columns,
                                missing_values: rep.dataset_overview.missing_values,
                                duplicate_rows: rep.dataset_overview.duplicate_rows,
                                numeric_columns: rep.statistical_summary.map((s) => s.column),
                                categorical_columns: rep.categorical_analysis.map((c) => c.column),
                                date_columns: rep.dataset_overview.column_details
                                    .filter((c) => c.detected_type === "date")
                                    .map((c) => c.name),
                                column_details: rep.dataset_overview.column_details,
                            },
                        });
                        refreshAnalytics();
                    }
                })
                .catch(() => {
                    // No dataset on backend, ignore
                });
        }
    }, []);

    const hasDataset = Boolean(dataset || report);

    return (
        <DatasetContext.Provider
            value={{
                dataset,
                analytics,
                report,
                loadingAnalytics,
                loadingReport,
                hasDataset,
                uploadModalOpen,
                setUploadModalOpen,
                historyPanelOpen,
                setHistoryPanelOpen,
                handleUploadSuccess,
                activateDatasetById,
                deleteDatasetById,
                refreshAnalytics,
                refreshReport,
                clearDataset,
            }}
        >
            {children}
        </DatasetContext.Provider>
    );
}

export function useDataset(): DatasetContextType {
    const context = useContext(DatasetContext);
    if (!context) {
        throw new Error("useDataset must be used within a DatasetProvider");
    }
    return context;
}
