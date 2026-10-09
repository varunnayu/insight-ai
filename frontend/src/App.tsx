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
        <DashboardLayout>
            <Routes>
                {/* Dashboard routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Working Reports route */}
                <Route path="/reports" element={<Reports />} />

                {/* Dataset History route */}
                <Route path="/history" element={<History />} />

                {/* Additional modules */}
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/insights" element={<AIInsights />} />
                <Route path="/analyst" element={<AIAnalyst />} />
                <Route path="/forecast" element={<Forecast />} />
                <Route path="/anomalies" element={<Anomalies />} />
                <Route path="/settings" element={<Settings />} />

                {/* Fallback */}
                <Route path="*" element={<Dashboard />} />
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
        </DashboardLayout>
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