import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Subtask, Task, User } from "@/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TaskSubtasksProps {
    taskId: string;
}

export default function TaskSubtasks({ taskId }: TaskSubtasksProps) {
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const queryClient = useQueryClient();

    const { data: subtasks = [], isLoading } = useQuery({
        queryKey: ["subtasks", taskId],
        queryFn: async () => {
            try {
                // CRITICAL: Verify user owns the task before loading subtasks
                const user = await User.me();
                if (!user?.email) {
                    console.error("No authenticated user found");
                    return [];
                }

                // First verify the task belongs to this user
                const tasks = await Task.filter({ 
                    id: taskId,
                    created_by: user.email 
                });
                
                if (!tasks || tasks.length === 0) {
                    console.error("Task not found or access denied");
                    return [];
                }

                // Now load subtasks for this verified task
                const result = await Subtask.filter({ parentTaskId: taskId }, "order");
                return result || [];
            } catch (error) {
                console.error("Error fetching subtasks:", error);
                return [];
            }
        },
    });

    const createSubtaskMutation = useMutation({
        mutationFn: async (title: string) => {
            // Verify ownership before creating subtask
            const user = await User.me();
            if (!user?.email) {
                throw new Error("Not authenticated");
            }

            const tasks = await Task.filter({ 
                id: taskId,
                created_by: user.email 
            });
            
            if (!tasks || tasks.length === 0) {
                throw new Error("Access denied");
            }

            await Subtask.create({
                parentTaskId: taskId,
                title,
                completed: false,
                order: subtasks.length,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
            setNewSubtaskTitle("");
            setIsAdding(false);
            toast.success("Subtask added");
        },
        onError: (error: any) => {
            console.error("Error creating subtask:", error);
            toast.error(error.message || "Failed to add subtask");
        },
    });

    const toggleSubtaskMutation = useMutation({
        mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
            // Verify ownership before toggling
            const user = await User.me();
            if (!user?.email) {
                throw new Error("Not authenticated");
            }

            const tasks = await Task.filter({ 
                id: taskId,
                created_by: user.email 
            });
            
            if (!tasks || tasks.length === 0) {
                throw new Error("Access denied");
            }

            await Subtask.update(id, {
                completed: !completed,
                completedAt: !completed ? new Date().toISOString() : null,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
        },
        onError: (error: any) => {
            console.error("Error toggling subtask:", error);
            toast.error(error.message || "Failed to update subtask");
        },
    });

    const deleteSubtaskMutation = useMutation({
        mutationFn: async (id: string) => {
            // Verify ownership before deleting
            const user = await User.me();
            if (!user?.email) {
                throw new Error("Not authenticated");
            }

            const tasks = await Task.filter({ 
                id: taskId,
                created_by: user.email 
            });
            
            if (!tasks || tasks.length === 0) {
                throw new Error("Access denied");
            }

            await Subtask.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
            toast.success("Subtask deleted");
        },
        onError: (error: any) => {
            console.error("Error deleting subtask:", error);
            toast.error(error.message || "Failed to delete subtask");
        },
    });

    const handleAddSubtask = () => {
        if (newSubtaskTitle.trim()) {
            createSubtaskMutation.mutate(newSubtaskTitle);
        }
    };

    const completedCount = subtasks.filter((s: any) => s.completed).length;
    const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">
                        Subtasks ({completedCount}/{subtasks.length})
                    </h3>
                </div>
                {!isAdding && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subtask
                    </Button>
                )}
            </div>

            {subtasks.length > 0 && (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-banana-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {isAdding && (
                <div className="flex gap-2">
                    <Input
                        placeholder="Subtask title"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddSubtask();
                            if (e.key === "Escape") {
                                setIsAdding(false);
                                setNewSubtaskTitle("");
                            }
                        }}
                        autoFocus
                    />
                    <Button onClick={handleAddSubtask} size="sm">
                        Add
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setIsAdding(false);
                            setNewSubtaskTitle("");
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {subtasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                    No subtasks yet. Break down this task into smaller steps!
                </p>
            ) : (
                <div className="space-y-2">
                    {subtasks.map((subtask: any) => (
                        <div
                            key={subtask.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group"
                        >
                            <Checkbox
                                checked={subtask.completed}
                                onCheckedChange={() =>
                                    toggleSubtaskMutation.mutate({
                                        id: subtask.id,
                                        completed: subtask.completed,
                                    })
                                }
                            />
                            <span
                                className={`flex-1 text-sm ${
                                    subtask.completed
                                        ? "line-through text-muted-foreground"
                                        : ""
                                }`}
                            >
                                {subtask.title}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                                onClick={() => {
                                    if (confirm("Delete this subtask?")) {
                                        deleteSubtaskMutation.mutate(subtask.id);
                                    }
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}