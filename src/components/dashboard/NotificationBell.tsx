import { useQuery } from "@tanstack/react-query";
import { Task } from "@/entities";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow, isPast } from "date-fns";

interface NotificationBellProps {
    onTaskClick: (task: any) => void;
}

export default function NotificationBell({ onTaskClick }: NotificationBellProps) {
    const { data: tasks = [] } = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            try {
                const result = await Task.filter({ deleted: false }, "-created_at");
                return result || [];
            } catch (error) {
                console.error("Error fetching tasks:", error);
                return [];
            }
        },
    });

    // Filter for upcoming and overdue tasks (excluding deleted ones)
    const upcomingTasks = tasks.filter((task: any) => {
        if (!task.dueDate || task.completed || task.deleted) return false;
        const dueDate = new Date(task.dueDate);
        return isToday(dueDate) || isTomorrow(dueDate) || isPast(dueDate);
    });

    const overdueTasks = upcomingTasks.filter((task: any) => {
        const dueDate = new Date(task.dueDate);
        return isPast(dueDate) && !isToday(dueDate);
    });

    const todayTasks = upcomingTasks.filter((task: any) => {
        const dueDate = new Date(task.dueDate);
        return isToday(dueDate);
    });

    const tomorrowTasks = upcomingTasks.filter((task: any) => {
        const dueDate = new Date(task.dueDate);
        return isTomorrow(dueDate);
    });

    const notificationCount = upcomingTasks.length;

    const getTaskLabel = (task: any) => {
        const dueDate = new Date(task.dueDate);
        if (isPast(dueDate) && !isToday(dueDate)) {
            return "Overdue";
        } else if (isToday(dueDate)) {
            return "Today";
        } else if (isTomorrow(dueDate)) {
            return "Tomorrow";
        }
        return format(dueDate, "MMM d");
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                            {notificationCount > 9 ? "9+" : notificationCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Notifications</h3>
                        {notificationCount > 0 && (
                            <Badge variant="secondary">{notificationCount}</Badge>
                        )}
                    </div>

                    {notificationCount === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No upcoming tasks. You're all caught up! 🎉
                        </p>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {/* Overdue Tasks */}
                            {overdueTasks.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-red-600 uppercase">
                                        Overdue ({overdueTasks.length})
                                    </h4>
                                    {overdueTasks.map((task: any) => (
                                        <button
                                            key={task.id}
                                            onClick={() => onTaskClick(task)}
                                            className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-medium line-clamp-1">
                                                    {task.title}
                                                </p>
                                                <Badge
                                                    variant="destructive"
                                                    className="text-xs shrink-0"
                                                >
                                                    {getTaskLabel(task)}
                                                </Badge>
                                            </div>
                                            {task.priority && (
                                                <Badge variant="outline" className="text-xs mt-1">
                                                    {task.priority}
                                                </Badge>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Today's Tasks */}
                            {todayTasks.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-orange-600 uppercase">
                                        Today ({todayTasks.length})
                                    </h4>
                                    {todayTasks.map((task: any) => (
                                        <button
                                            key={task.id}
                                            onClick={() => onTaskClick(task)}
                                            className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-medium line-clamp-1">
                                                    {task.title}
                                                </p>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs shrink-0 bg-orange-100 text-orange-800 dark:bg-orange-900/30"
                                                >
                                                    {getTaskLabel(task)}
                                                </Badge>
                                            </div>
                                            {task.priority && (
                                                <Badge variant="outline" className="text-xs mt-1">
                                                    {task.priority}
                                                </Badge>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Tomorrow's Tasks */}
                            {tomorrowTasks.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-blue-600 uppercase">
                                        Tomorrow ({tomorrowTasks.length})
                                    </h4>
                                    {tomorrowTasks.map((task: any) => (
                                        <button
                                            key={task.id}
                                            onClick={() => onTaskClick(task)}
                                            className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-medium line-clamp-1">
                                                    {task.title}
                                                </p>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs shrink-0"
                                                >
                                                    {getTaskLabel(task)}
                                                </Badge>
                                            </div>
                                            {task.priority && (
                                                <Badge variant="outline" className="text-xs mt-1">
                                                    {task.priority}
                                                </Badge>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}