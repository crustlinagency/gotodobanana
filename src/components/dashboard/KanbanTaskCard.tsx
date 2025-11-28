import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag } from "lucide-react";
import { format } from "date-fns";

interface KanbanTaskCardProps {
    task: any;
    onClick: (task: any) => void;
}

export default function KanbanTaskCard({ task, onClick }: KanbanTaskCardProps) {
    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case "High":
                return "border-l-4 border-l-red-500";
            case "Medium":
                return "border-l-4 border-l-yellow-500";
            case "Low":
                return "border-l-4 border-l-green-500";
            default:
                return "";
        }
    };

    const isOverdue =
        task.dueDate &&
        !task.completed &&
        new Date(task.dueDate) < new Date();

    return (
        <Card
            className={`p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow ${getPriorityClass(
                task.priority
            )}`}
            onClick={() => onClick(task)}
            draggable
        >
            <h4 className="font-medium text-sm mb-2">{task.title}</h4>

            {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {task.description}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2">
                {task.dueDate && (
                    <Badge
                        variant="outline"
                        className={`text-xs ${
                            isOverdue
                                ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300"
                                : ""
                        }`}
                    >
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(task.dueDate), "MMM d")}
                    </Badge>
                )}

                {task.tags && task.tags.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {task.tags[0]}
                        {task.tags.length > 1 && ` +${task.tags.length - 1}`}
                    </Badge>
                )}

                {task.priority && (
                    <Badge variant="outline" className="text-xs">
                        {task.priority}
                    </Badge>
                )}
            </div>
        </Card>
    );
}