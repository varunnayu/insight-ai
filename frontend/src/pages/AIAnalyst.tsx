import ComingSoon from "../components/ui/ComingSoon";
import { Bot, MessageSquare, Lightbulb, FileSearch } from "lucide-react";

export default function AIAnalyst() {
    return (
        <ComingSoon
            featureName="InsightAI"
            title="AI Analyst"
            description="A conversational AI analyst that answers your business questions in plain English — query your data, uncover root causes, and get on-demand recommendations without writing a single line of SQL."
            illustration="ai-analyst"
            features={[
                { label: "Natural Language Queries", icon: <MessageSquare size={15} /> },
                { label: "Conversational AI", icon: <Bot size={15} /> },
                { label: "Smart Suggestions", icon: <Lightbulb size={15} /> },
                { label: "Deep Drill-down", icon: <FileSearch size={15} /> },
            ]}
        />
    );
}
