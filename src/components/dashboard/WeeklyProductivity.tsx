import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Zap } from "lucide-react";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

interface WeeklyProductivityProps {
    tasks: any[];
}

export default function WeeklyProductivity({ tasks }: WeeklyProductivityProps) {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    // Tasks completed this week
    const completedThisWeek = tasks.filter((task: any) => {
        if (!task.completed || !task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return isWithinInterval(completedDate, { start: weekStart, end: weekEnd });
    }).length;

    // Tasks created this week
    const createdThisWeek = tasks.filter((task: any) => {
        if (!task.created_at) return false;
        const createdDate = new Date(task.created_at);
        return isWithinInterval(createdDate, { start: weekStart, end: weekEnd });
    }).length;

    // High priority tasks completed
    const highPriorityCompleted = tasks.filter((task: any) => {
        if (!task.completed || !task.completedAt || task.priority !== "High") return false;
        const completedDate = new Date(task.completedAt);
        return isWithinInterval(completedDate, { start: weekStart, end: weekEnd });
    }).length;

    const completionRate = createdThisWeek > 0 
        ? Math.round((completedThisWeek / createdThisWeek) * 100) 
        : 0;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-grape-600" />
                    This Week's Progress
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-banana-600" />
                            <span className="text-sm font-medium">Tasks Completed</span>
                        </div>
                        <span className="text-lg font-bold text-banana-600">{completedThisWeek}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">High Priority Done</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">{highPriorityCompleted}</span>
                    </div>

                    {createdThisWeek > 0 && (
                        <div className="pt-2 border-t">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Completion Rate</span>
                                <span className="font-semibold">{completionRate}%</span>
                            </div>
                            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-banana-500 to-grape-500 transition-all duration-500"
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}