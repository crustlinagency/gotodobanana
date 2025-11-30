import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Subtask, User } from "@/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TaskSubtasksProps {
  taskId: string;
}

export default function TaskSubtasks({ taskId }: TaskSubtasksProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const user = await User.me();
      return user;
    },
  });

  const { data: subtasks = [], isLoading } = useQuery({
    queryKey: ["subtasks", taskId],
    queryFn: async () => {
      try {
        console.log("✅ SECURITY: Fetching subtasks for task:", taskId);
        const result = await Subtask.filter({ parentTaskId: taskId }, "order");
        console.log(`✅ SECURITY: Found ${result?.length || 0} subtasks`);
        return result || [];
      } catch (error) {
        console.error("❌ SECURITY: Error fetching subtasks:", error);
        return [];
      }
    },
  });

  const createSubtaskMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      console.log("✅ SECURITY: Creating subtask with userId:", user.id);
      return await Subtask.create({
        parentTaskId: taskId,
        userId: user.id,
        title,
        completed: false,
        order: subtasks.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
      setNewSubtaskTitle("");
      toast.success("Subtask added");
    },
    onError: (error: any) => {
      console.error("❌ SECURITY: Error creating subtask:", error);
      toast.error("Failed to add subtask");
    },
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return await Subtask.update(id, {
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
    },
    onError: () => {
      toast.error("Failed to update subtask");
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: async (id: string) => {
      return await Subtask.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
      toast.success("Subtask deleted");
    },
    onError: () => {
      toast.error("Failed to delete subtask");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      createSubtaskMutation.mutate(newSubtaskTitle);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-banana-500" />
      </div>
    );
  }

  const isAnyActionPending = createSubtaskMutation.isPending || 
                             toggleSubtaskMutation.isPending || 
                             deleteSubtaskMutation.isPending;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Add a subtask..."
          className="flex-1"
          disabled={createSubtaskMutation.isPending}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!newSubtaskTitle.trim() || createSubtaskMutation.isPending}
          className="bg-banana-500 hover:bg-banana-600 text-black"
        >
          {createSubtaskMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </form>

      <div className="space-y-2">
        {subtasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">
            No subtasks yet. Add one to break down this task!
          </p>
        ) : (
          subtasks.map((subtask: any) => (
            <div
              key={subtask.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50"
            >
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={(checked) =>
                  toggleSubtaskMutation.mutate({
                    id: subtask.id,
                    completed: checked as boolean,
                  })
                }
                disabled={isAnyActionPending}
              />
              <span
                className={`flex-1 text-sm ${
                  subtask.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {subtask.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteSubtaskMutation.mutate(subtask.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                disabled={isAnyActionPending}
              >
                {deleteSubtaskMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}