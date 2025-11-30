import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, User } from "@/entities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { useState } from "react";

export default function TrashView() {
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: deletedTasks = [], isLoading } = useQuery({
    queryKey: ["deletedTasks"],
    queryFn: async () => {
      try {
        const user = await User.me();
        if (!user?.id) {
          console.error("❌ SECURITY: No authenticated user found");
          return [];
        }

        console.log("✅ SECURITY: Fetching deleted tasks for userId:", user.id);
        const result = await Task.filter({ 
          deleted: true,
          userId: user.id // CRITICAL: Filter by userId
        }, "-deletedAt");
        
        console.log(`✅ SECURITY: Found ${result?.length || 0} deleted tasks`);
        return result || [];
      } catch (error) {
        console.error("❌ SECURITY: Error fetching deleted tasks:", error);
        return [];
      }
    },
  });

  const restoreMutation = useMutation({
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
    onError: () => {
      toast.error("Failed to restore task");
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await Task.delete(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deletedTasks"] });
      toast.success("Task permanently deleted");
      setTaskToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete task");
      setTaskToDelete(null);
    },
  });

  const emptyTrashMutation = useMutation({
    mutationFn: async () => {
      const deletePromises = deletedTasks.map((task: any) => Task.delete(task.id));
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deletedTasks"] });
      toast.success("Trash emptied successfully");
    },
    onError: () => {
      toast.error("Failed to empty trash");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-banana-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trash</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {deletedTasks.length} {deletedTasks.length === 1 ? "item" : "items"}
          </p>
        </div>
        {deletedTasks.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => emptyTrashMutation.mutate()}
            disabled={emptyTrashMutation.isPending}
          >
            {emptyTrashMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Empty Trash
          </Button>
        )}
      </div>

      {deletedTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Trash is empty</h3>
          <p className="text-muted-foreground">
            Deleted tasks will appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {deletedTasks.map((task: any) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{task.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Deleted {task.deletedAt ? format(new Date(task.deletedAt), "PPp") : "recently"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => restoreMutation.mutate(task.id)}
                    disabled={restoreMutation.isPending}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setTaskToDelete(task)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Forever
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            permanentDeleteMutation.mutate(taskToDelete.id);
          }
        }}
        itemName={taskToDelete?.title}
        permanent
      />
    </div>
  );
}