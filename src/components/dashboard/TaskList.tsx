import TaskCard from "./TaskCard";
import BulkActionsToolbar from "./BulkActionsToolbar";
import { AlertCircle } from "lucide-react";
import { Task } from "@/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskListProps {
  tasks: any[];
  onEditTask: (task: any) => void;
}

export default function TaskList({ tasks, onEditTask }: TaskListProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [showSelection, setShowSelection] = useState(false);
  const queryClient = useQueryClient();
  const draggedTaskIdRef = useRef<string | null>(null);
  const draggedOverTaskIdRef = useRef<string | null>(null);

  const reorderTasksMutation = useMutation({
    mutationFn: async ({ taskId, newOrder }: { taskId: string; newOrder: number }) => {
      await Task.update(taskId, { order: newOrder });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Error reordering tasks:", error);
      toast.error("Failed to reorder tasks");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (taskIds: string[]) => {
      await Task.batch().delete(taskIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setSelectedTaskIds(new Set());
      setShowSelection(false);
      toast.success("Tasks deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting tasks:", error);
      toast.error("Failed to delete tasks");
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: Array<{ id: string; data: any }>) => {
      await Task.batch().update(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setSelectedTaskIds(new Set());
      setShowSelection(false);
      toast.success("Tasks updated successfully");
    },
    onError: (error) => {
      console.error("Error updating tasks:", error);
      toast.error("Failed to update tasks");
    },
  });

  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const taskCard = target.closest("[data-task-card-id]") as HTMLElement;
      
      if (taskCard) {
        const taskId = taskCard.getAttribute("data-task-card-id");
        if (taskId) {
          draggedTaskIdRef.current = taskId;
          e.dataTransfer!.effectAllowed = "move";
          taskCard.style.opacity = "0.5";
        }
      }
    };

    const handleDragEnd = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const taskCard = target.closest("[data-task-card-id]") as HTMLElement;
      
      if (taskCard) {
        taskCard.style.opacity = "1";
      }
      
      draggedTaskIdRef.current = null;
      draggedOverTaskIdRef.current = null;
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      const taskCard = target.closest("[data-task-card-id]") as HTMLElement;
      
      if (taskCard) {
        const taskId = taskCard.getAttribute("data-task-card-id");
        draggedOverTaskIdRef.current = taskId;
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      
      const draggedId = draggedTaskIdRef.current;
      const targetId = draggedOverTaskIdRef.current;
      
      if (!draggedId || !targetId || draggedId === targetId) return;

      const draggedIndex = tasks.findIndex((t) => t.id === draggedId);
      const targetIndex = tasks.findIndex((t) => t.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newTasks = [...tasks];
        const [removed] = newTasks.splice(draggedIndex, 1);
        newTasks.splice(targetIndex, 0, removed);

        newTasks.forEach((task, index) => {
          if (task.order !== index) {
            reorderTasksMutation.mutate({ taskId: task.id, newOrder: index });
          }
        });

        toast.success("Task reordered");
      }
    };

    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("dragend", handleDragEnd);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, [tasks, reorderTasksMutation]);

  const handleSelectTask = (taskId: string, selected: boolean) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(new Set(tasks.map((t) => t.id)));
    } else {
      setSelectedTaskIds(new Set());
    }
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedTaskIds.size} selected tasks?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedTaskIds));
    }
  };

  const handleMoveToList = (listId: string) => {
    const updates = Array.from(selectedTaskIds).map((id) => ({
      id,
      data: { listId },
    }));
    bulkUpdateMutation.mutate(updates);
  };

  const handleMarkComplete = () => {
    const updates = Array.from(selectedTaskIds).map((id) => ({
      id,
      data: { 
        completed: true, 
        completedAt: new Date().toISOString(),
        status: "completed",
      },
    }));
    bulkUpdateMutation.mutate(updates);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
        <p className="text-muted-foreground">
          Create your first task to get started!
        </p>
      </div>
    );
  }

  const allSelected = tasks.length > 0 && selectedTaskIds.size === tasks.length;
  const someSelected = selectedTaskIds.size > 0 && selectedTaskIds.size < tasks.length;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showSelection ? (
            <>
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className={someSelected ? "data-[state=checked]:bg-banana-500" : ""}
              />
              <span className="text-sm text-muted-foreground">
                {selectedTaskIds.size > 0 
                  ? `${selectedTaskIds.size} of ${tasks.length} selected`
                  : "Select tasks"}
              </span>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSelection(true)}
            >
              Select Tasks
            </Button>
          )}
        </div>
        
        {showSelection && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowSelection(false);
              setSelectedTaskIds(new Set());
            }}
          >
            Cancel
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            isSelected={selectedTaskIds.has(task.id)}
            onSelectChange={(selected) => handleSelectTask(task.id, selected)}
            showSelection={showSelection}
          />
        ))}
      </div>

      <BulkActionsToolbar
        selectedCount={selectedTaskIds.size}
        onDeleteSelected={handleDeleteSelected}
        onMoveToList={handleMoveToList}
        onMarkComplete={handleMarkComplete}
        onClearSelection={() => {
          setSelectedTaskIds(new Set());
          setShowSelection(false);
        }}
      />
    </>
  );
}