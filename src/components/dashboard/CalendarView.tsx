import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from "date-fns";

interface CalendarViewProps {
    tasks: any[];
    onEditTask: (task: any) => void;
    onNewTask: () => void;
}

export default function CalendarView({ tasks, onEditTask, onNewTask }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const getTasksForDay = (day: Date) => {
        return tasks.filter((task) => {
            if (!task.dueDate) return false;
            return isSameDay(new Date(task.dueDate), day);
        });
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "High":
                return "bg-red-500";
            case "Medium":
                return "bg-yellow-500";
            case "Low":
                return "bg-green-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    {format(currentDate, "MMMM yyyy")}
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday}>
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <Card className="overflow-hidden">
                <div className="grid grid-cols-7 border-b">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="p-3 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {days.map((day, index) => {
                        const dayTasks = getTasksForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isDayToday = isToday(day);

                        return (
                            <div
                                key={day.toISOString()}
                                className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                                    index >= days.length - 7 ? "border-b-0" : ""
                                } ${!isCurrentMonth ? "bg-muted/30" : ""} ${
                                    isDayToday ? "bg-banana-50 dark:bg-banana-950/20" : ""
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span
                                        className={`text-sm font-medium ${
                                            isDayToday
                                                ? "bg-banana-500 text-black rounded-full w-7 h-7 flex items-center justify-center"
                                                : !isCurrentMonth
                                                ? "text-muted-foreground"
                                                : ""
                                        }`}
                                    >
                                        {format(day, "d")}
                                    </span>
                                    {isCurrentMonth && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-50 hover:opacity-100 hover:bg-banana-100 dark:hover:bg-banana-950/50 transition-all"
                                            onClick={onNewTask}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    {dayTasks.slice(0, 3).map((task) => (
                                        <button
                                            key={task.id}
                                            onClick={() => onEditTask(task)}
                                            className="w-full text-left text-xs p-1.5 rounded bg-card border hover:shadow-md transition-shadow duration-200 flex items-center gap-1 group"
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
                                            <span className="truncate flex-1 group-hover:text-banana-600">
                                                {task.title}
                                            </span>
                                            {task.completed && (
                                                <span className="text-green-600">✓</span>
                                            )}
                                        </button>
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <div className="text-xs text-muted-foreground text-center">
                                            +{dayTasks.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}