import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { getTaskPreview } from "@/lib/html-utils";
import { Task, User } from "@/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface KanbanTaskCardProps {
    task: any;
    onClick: (task: any) => void;
}

export default function KanbanTaskCard({ task, onClick }: KanbanTaskCardProps) {
    const queryClient = useQueryClient();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const softDeleteMutation = useMutation({
        mutationFn: async () => {
            // CRITICAL: Verify task ownership before delete
            const user = await User.me();
            if (!user?.email) {
                throw new Error("Not authenticated");
            }

            const existingTask = await Task.filter({ 
                id: task.id, 
                created_by: user.email 
            });

            if (!existingTask || existingTask.length === 0) {
                throw new Error("Task not found or access denied");
            }

            await Task.update(task.id, {
                deleted: true,
                deletedAt: new Date().toISOString(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Task moved to trash");
        },
        onError: (error: any) => {
            console.error("Error deleting task:", error);
            toast.error(error.message || "Failed to delete task");
        },
    });

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
        <>
            <Card
                className={`p-3 group cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow ${getPriorityClass(
                    task.priority
                )}`}
            >
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 
                        className="font-medium text-sm flex-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(task);
                        }}
                    >
                        {task.title}
                    </h4>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteDialog(true);
                        }}
                    >
                        <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                </div>

                {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {getTaskPreview(task.description, 80)}
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

            <DeleteConfirmDialog
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={() => {
                    softDeleteMutation.mutate();
                    setShowDeleteDialog(false);
                }}
                itemName={task.title}
            />
        </>
    );
}