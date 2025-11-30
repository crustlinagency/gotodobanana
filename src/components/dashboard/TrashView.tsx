import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/entities";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TrashView() {
    const { data: user } = useUser();
    const queryClient = useQueryClient();
    const [taskToDelete, setTaskToDelete] = useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: deletedTasks = [], isLoading } = useQuery({
        queryKey: ["deletedTasks", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            console.log("✅ SECURITY: Fetching deleted tasks for userId:", user.id);
            const result = await Task.filter({ deleted: true, userId: user.id }, "-deletedAt");
            console.log("✅ SECURITY: Found deleted tasks:", result?.length || 0);
            return result || [];
        },
        enabled: !!user?.id,
    });

    const restoreMutation = useMutation({
        mutationFn: async (task: any) => {
            console.log("🔄 Restoring task:", task.id);
            await Task.update(task.id, {
                deleted: false,
                deletedAt: null,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deletedTasks"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["deletedTasksCount"] });
            toast.success("Task restored successfully");
        },
        onError: (error: any) => {
            console.error("❌ Error restoring task:", error);
            toast.error("Failed to restore task");
        },
    });

    const permanentDeleteMutation = useMutation({
        mutationFn: async (taskId: string) => {
            console.log("🗑️ PERMANENTLY deleting task from database:", taskId);
            await Task.delete(taskId);
            console.log("✅ Task permanently removed from database");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deletedTasks"] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["deletedTasksCount"] });
            toast.success("Task permanently deleted from database");
            setIsDeleteDialogOpen(false);
            setTaskToDelete(null);
        },
        onError: (error: any) => {
            console.error("❌ Error permanently deleting task:", error);
            toast.error("Failed to permanently delete task");
        },
    });

    const handleRestore = (task: any) => {
        if (!restoreMutation.isPending) {
            restoreMutation.mutate(task);
        }
    };

    const handlePermanentDelete = (task: any) => {
        setTaskToDelete(task);
        setIsDeleteDialogOpen(true);
    };

    const confirmPermanentDelete = () => {
        if (taskToDelete && !permanentDeleteMutation.isPending) {
            permanentDeleteMutation.mutate(taskToDelete.id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-banana-600" />
            </div>
        );
    }

    if (deletedTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Trash2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Trash is empty</h3>
                <p className="text-muted-foreground">
                    Deleted tasks will appear here before being permanently removed
                </p>
            </div>
        );
    }

    const isAnyActionPending = restoreMutation.isPending || permanentDeleteMutation.isPending;

    return (
        <div className="space-y-6">
            <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <CardTitle>Trash</CardTitle>
                    </div>
                    <CardDescription>
                        {deletedTasks.length} {deletedTasks.length === 1 ? "task" : "tasks"} in trash. 
                        Restore or permanently delete items.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-4">
                {deletedTasks.map((task: any) => (
                    <Card key={task.id} className="border-muted">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg line-through text-muted-foreground">
                                            {task.title}
                                        </h3>
                                        {task.priority && (
                                            <Badge
                                                variant="outline"
                                                className={
                                                    task.priority === "High"
                                                        ? "priority-high"
                                                        : task.priority === "Medium"
                                                        ? "priority-medium"
                                                        : "priority-low"
                                                }
                                            >
                                                {task.priority}
                                            </Badge>
                                        )}
                                    </div>
                                    {task.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        {task.deletedAt && (
                                            <span>
                                                Deleted {formatDistanceToNow(new Date(task.deletedAt), { addSuffix: true })}
                                            </span>
                                        )}
                                        {task.tags && task.tags.length > 0 && (
                                            <div className="flex gap-1">
                                                {task.tags.map((tag: string, index: number) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRestore(task)}
                                        disabled={isAnyActionPending}
                                    >
                                        {restoreMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                            <RotateCcw className="h-4 w-4 mr-1" />
                                        )}
                                        Restore
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handlePermanentDelete(task)}
                                        disabled={isAnyActionPending}
                                    >
                                        {permanentDeleteMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4 mr-1" />
                                        )}
                                        Delete Forever
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
                if (!open && !permanentDeleteMutation.isPending) {
                    setIsDeleteDialogOpen(false);
                    setTaskToDelete(null);
                }
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently Delete Task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The task "{taskToDelete?.title}" will be 
                            permanently removed from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={permanentDeleteMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmPermanentDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={permanentDeleteMutation.isPending}
                        >
                            {permanentDeleteMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Forever"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}