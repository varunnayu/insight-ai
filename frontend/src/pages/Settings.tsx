import ComingSoon from "../components/ui/ComingSoon";
import { Settings2, Users, Key, Plug } from "lucide-react";

export default function Settings() {
    return (
        <ComingSoon
            featureName="InsightAI"
            title="Settings"
            description="Manage your workspace preferences, team members, API keys, and integrations — full control over how InsightAI works for your business."
            illustration="settings"
            features={[
                { label: "Workspace Config", icon: <Settings2 size={15} /> },
                { label: "Team Management", icon: <Users size={15} /> },
                { label: "API Keys", icon: <Key size={15} /> },
                { label: "Integrations", icon: <Plug size={15} /> },
            ]}
        />
    );
}
