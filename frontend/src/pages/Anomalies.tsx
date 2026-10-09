import ComingSoon from "../components/ui/ComingSoon";
import { AlertTriangle, Bell, Search, Shield } from "lucide-react";

export default function Anomalies() {
    return (
        <ComingSoon
            featureName="InsightAI"
            title="Anomaly Detection"
            description="Automatically surface unusual patterns, unexpected spikes, outliers, and data quality issues in your business metrics — before they become costly problems."
            illustration="anomalies"
            features={[
                { label: "Spike Detection", icon: <AlertTriangle size={15} /> },
                { label: "Smart Alerts", icon: <Bell size={15} /> },
                { label: "Outlier Search", icon: <Search size={15} /> },
                { label: "Data Quality", icon: <Shield size={15} /> },
            ]}
        />
    );
}
