import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { format } from "date-fns";

interface DailyOverviewProps {
    tasks: any[];
    onTaskClick: (task: any) => void;
}

export default function DailyOverview({ tasks, onTaskClick }: DailyOverviewProps) {
    const today = new Date();
    const todayStr = format(today, "EEEE, MMMM d");
    
    // Get today's tasks
    const todayTasks = tasks.filter((task: any) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return (
            dueDate.getDate() === today.getDate() &&
            dueDate.getMonth() === today.getMonth() &&
            dueDate.getFullYear() === today.getFullYear()
        );
    });

    const completedToday = todayTasks.filter((t: any) => t.completed).length;
    const pendingToday = todayTasks.length - completedToday;

    return (
        <Card className="border-banana-200 dark:border-banana-900">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-banana-600" />
                    Today's Focus - {todayStr}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {todayTasks.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        No tasks scheduled for today. You're all caught up! 🎉
                    </p>
                ) : (
                    <>
                        <div className="flex gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Circle className="h-4 w-4 text-banana-600" />
                                <span className="text-muted-foreground">Pending:</span>
                                <span className="font-semibold">{pendingToday}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-muted-foreground">Completed:</span>
                                <span className="font-semibold">{completedToday}</span>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {todayTasks.map((task: any) => (
                                <button
                                    key={task.id}
                                    onClick={() => onTaskClick(task)}
                                    className="w-full text-left p-2 rounded-lg border bg-card hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-start gap-2">
                                        {task.completed ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                                                {task.title}
                                            </p>
                                            {task.priority && (
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                                    task.priority === "High" 
                                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                                                        : task.priority === "Medium"
                                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                }`}>
                                                    {task.priority}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}