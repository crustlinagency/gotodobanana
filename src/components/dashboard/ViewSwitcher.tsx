import { Button } from "@/components/ui/button";
import { List, Calendar, Columns3 } from "lucide-react";

interface ViewSwitcherProps {
    currentView: "list" | "calendar" | "kanban";
    onViewChange: (view: "list" | "calendar" | "kanban") => void;
}

export default function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
    const views = [
        { id: "list" as const, label: "List", icon: List },
        { id: "calendar" as const, label: "Calendar", icon: Calendar },
        { id: "kanban" as const, label: "Kanban", icon: Columns3 },
    ];

    return (
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
            {views.map((view) => {
                const Icon = view.icon;
                const isActive = currentView === view.id;
                
                return (
                    <Button
                        key={view.id}
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        onClick={() => onViewChange(view.id)}
                        className={isActive ? "bg-banana-500 hover:bg-banana-600 text-black" : ""}
                    >
                        <Icon className="h-4 w-4 mr-2" />
                        {view.label}
                    </Button>
                );
            })}
        </div>
    );
}