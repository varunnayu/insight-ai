import ComingSoon from "../components/ui/ComingSoon";
import { LineChart, TrendingUp, Calendar, Activity } from "lucide-react";

export default function Forecast() {
    return (
        <ComingSoon
            featureName="InsightAI"
            title="Revenue Forecasting"
            description="Machine-learning powered forecasting that predicts future revenue, demand trends, and seasonal patterns — giving you a data-backed view of where your business is headed."
            illustration="forecast"
            features={[
                { label: "ML Predictions", icon: <LineChart size={15} /> },
                { label: "Trend Extrapolation", icon: <TrendingUp size={15} /> },
                { label: "Seasonal Patterns", icon: <Calendar size={15} /> },
                { label: "Confidence Bands", icon: <Activity size={15} /> },
            ]}
        />
    );
}
