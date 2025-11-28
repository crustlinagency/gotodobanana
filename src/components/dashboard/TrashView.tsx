import { Task } from "@/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, Trash2, Calendar, Loader2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { getTaskPreview } from "@/lib/html-utils";

export default function TrashView() {
    const queryClient = useQueryClient();
    const [taskToDelete, setTaskToDelete] = useState<any>(null);

    const { data: deletedTasks = [], isLoading } = useQuery({
        queryKey: ["deletedTasks"],
        queryFn: async () => {
            const result = await Task.filter({ deleted: true }, "-deletedAt");
            return result || [];
        },
    });

    const restoreTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            await Task.update(taskId, {
                deleted: false,
                deletedAt: null,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deletedTasks"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Task restored successfully");
        },
    });

    const permanentDeleteMutation = useMutation({
        mutationFn: async (taskId: string) => {
            await Task.delete(taskId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deletedTasks"] });
            toast.success("Task permanently deleted");
        },
    });

    const emptyTrashMutation = useMutation({
        mutationFn: async () => {
            const deletePromises = deletedTasks.map((task) => Task.delete(task.id));
            await Promise.all(deletePromises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deletedTasks"] });
            toast.success("Trash emptied");
        },
    });

    const getDaysRemaining = (deletedAt: string) => {
        const daysPassed = differenceInDays(new Date(), new Date(deletedAt));
        return Math.max(0, 7 - daysPassed);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-banana-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Trash</h2>
                    <p className="text-muted-foreground">
                        Tasks are automatically deleted after 7 days
                    </p>
                </div>
                {deletedTasks.length > 0 && (
                    <Button
                        variant="destructive"
                        onClick={() => {
                            if (confirm("Permanently delete all tasks in trash? This cannot be undone.")) {
                                emptyTrashMutation.mutate();
                            }
                        }}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Empty Trash
                    </Button>
                )}
            </div>

            {deletedTasks.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-muted rounded-full">
                            <Trash2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Trash is empty</h3>
                            <p className="text-sm text-muted-foreground">
                                Deleted tasks will appear here
                            </p>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="space-y-3">
                    {deletedTasks.map((task) => {
                        const daysRemaining = getDaysRemaining(task.deletedAt);
                        return (
                            <Card key={task.id} className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{task.title}</h3>
                                            {task.priority && (
                                                <Badge variant="outline" className="text-xs">
                                                    {task.priority}
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        {task.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {getTaskPreview(task.description, 100)}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Deleted {format(new Date(task.deletedAt), "MMM d, yyyy")}
                                            </span>
                                            <Badge
                                                variant={daysRemaining <= 2 ? "destructive" : "secondary"}
                                                className="text-xs"
                                            >
                                                {daysRemaining === 0
                                                    ? "Deletes today"
                                                    : `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => restoreTaskMutation.mutate(task.id)}
                                        >
                                            <RefreshCcw className="h-4 w-4 mr-2" />
                                            Restore
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setTaskToDelete(task)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <DeleteConfirmDialog
                open={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={() => {
                    if (taskToDelete) {
                        permanentDeleteMutation.mutate(taskToDelete.id);
                        setTaskToDelete(null);
                    }
                }}
                itemName={taskToDelete?.title}
                isPermanent={true}
            />
        </div>
    );
}