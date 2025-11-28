import TaskCard from "./TaskCard";
import { AlertCircle } from "lucide-react";
import { Task } from "@/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { toast } from "sonner";

interface TaskListProps {
  tasks: any[];
  onEditTask: (task: any) => void;
}

export default function TaskList({ tasks, onEditTask }: TaskListProps) {
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
        // Reorder tasks optimistically
        const newTasks = [...tasks];
        const [removed] = newTasks.splice(draggedIndex, 1);
        newTasks.splice(targetIndex, 0, removed);

        // Update order for affected tasks
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

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEditTask}
        />
      ))}
    </div>
  );
}