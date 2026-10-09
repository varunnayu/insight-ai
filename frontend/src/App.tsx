import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import DashboardLayout from "./layouts/DashboardLayout";
import { DatasetProvider, useDataset } from "./context/DatasetContext";
import UploadDatasetModal from "./components/ui/UploadDatasetModal";

// ── Completed pages ─────────────────────────────────────────
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import History from "./pages/History";

// ── Feature pages ───────────────────────────────────────────
import Analytics from "./pages/Analytics";
import AIInsights from "./pages/AIInsights";
import AIAnalyst from "./pages/AIAnalyst";
import Forecast from "./pages/Forecast";
import Anomalies from "./pages/Anomalies";
import Settings from "./pages/Settings";

import Landing from "./pages/Landing";
import HistoryDrawer from "./components/layout/HistoryDrawer";

function AppContent() {
    const {
        uploadModalOpen,
        setUploadModalOpen,
        handleUploadSuccess,
        historyPanelOpen,
        setHistoryPanelOpen,
    } = useDataset();

    return (
        <>
            <Routes>
                {/* Standalone Landing Page */}
                <Route path="/" element={<Landing />} />
                <Route path="/welcome" element={<Landing />} />

                {/* Main Project & Dashboard Views */}
                <Route
                    path="/dashboard"
                    element={
                        <DashboardLayout>
                            <Dashboard />
                        </DashboardLayout>
                    }
                />

                {/* Working Reports route */}
                <Route
                    path="/reports"
                    element={
                        <DashboardLayout>
                            <Reports />
                        </DashboardLayout>
                    }
                />

                {/* Dataset History route */}
                <Route
                    path="/history"
                    element={
                        <DashboardLayout>
                            <History />
                        </DashboardLayout>
                    }
                />

                {/* Additional modules */}
                <Route
                    path="/analytics"
                    element={
                        <DashboardLayout>
                            <Analytics />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/insights"
                    element={
                        <DashboardLayout>
                            <AIInsights />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/analyst"
                    element={
                        <DashboardLayout>
                            <AIAnalyst />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/forecast"
                    element={
                        <DashboardLayout>
                            <Forecast />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/anomalies"
                    element={
                        <DashboardLayout>
                            <Anomalies />
                        </DashboardLayout>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <DashboardLayout>
                            <Settings />
                        </DashboardLayout>
                    }
                />

                {/* Fallback */}
                <Route
                    path="*"
                    element={
                        <DashboardLayout>
                            <Dashboard />
                        </DashboardLayout>
                    }
                />
            </Routes>

            {/* Global upload modal accessible across all views */}
            <UploadDatasetModal
                open={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onSuccess={handleUploadSuccess}
            />

            {/* Global dataset history slide-out drawer */}
            <HistoryDrawer
                open={historyPanelOpen}
                onClose={() => setHistoryPanelOpen(false)}
            />
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <DatasetProvider>
                <Toaster position="top-right" />
                <AppContent />
            </DatasetProvider>
        </BrowserRouter>
    );
}