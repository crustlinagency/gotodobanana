import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FocusModeProps {
    isActive: boolean;
    onToggle: () => void;
    filteredTasksCount: number;
}

export default function FocusMode({ isActive, onToggle, filteredTasksCount }: FocusModeProps) {
    return (
        <Card className={`border-2 transition-all ${isActive ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20" : "border-muted"}`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            {isActive ? (
                                <Eye className="h-5 w-5 text-purple-600" />
                            ) : (
                                <EyeOff className="h-5 w-5 text-muted-foreground" />
                            )}
                            <h3 className="font-semibold">Focus Mode</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {isActive 
                                ? `Showing ${filteredTasksCount} high-priority tasks only` 
                                : "Hide distractions, show only what matters now"}
                        </p>
                    </div>
                    <Button
                        onClick={onToggle}
                        variant={isActive ? "default" : "outline"}
                        className={isActive ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                        {isActive ? "Exit Focus" : "Activate"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}