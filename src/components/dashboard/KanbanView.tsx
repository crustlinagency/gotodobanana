import KanbanColumn from "./KanbanColumn";
import { Task } from "@/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface KanbanViewProps {
    tasks: any[];
    onEditTask: (task: any) => void;
    onNewTask: () => void;
}

export default function KanbanView({ tasks, onEditTask, onNewTask }: KanbanViewProps) {
    const queryClient = useQueryClient();
    const draggedTaskIdRef = useRef<string | null>(null);

    const updateTaskMutation = useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
            await Task.update(taskId, {
                status,
                completed: status === "completed",
                completedAt: status === "completed" ? new Date().toISOString() : null,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Task moved successfully");
        },
        onError: (error) => {
            console.error("Error updating task:", error);
            toast.error("Failed to move task");
        },
    });

    useEffect(() => {
        const handleDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            const taskCard = target.closest("[data-task-id]") as HTMLElement;
            
            if (taskCard) {
                const taskId = taskCard.getAttribute("data-task-id");
                if (taskId) {
                    draggedTaskIdRef.current = taskId;
                    e.dataTransfer!.effectAllowed = "move";
                    e.dataTransfer!.setData("text/html", taskId);
                    taskCard.style.opacity = "0.5";
                }
            }
        };

        const handleDragEnd = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            const taskCard = target.closest("[data-task-id]") as HTMLElement;
            
            if (taskCard) {
                taskCard.style.opacity = "1";
            }
            draggedTaskIdRef.current = null;
        };

        document.addEventListener("dragstart", handleDragStart);
        document.addEventListener("dragend", handleDragEnd);

        return () => {
            document.removeEventListener("dragstart", handleDragStart);
            document.removeEventListener("dragend", handleDragEnd);
        };
    }, []);

    const columns = [
        {
            title: "To Do",
            status: "todo",
            color: "bg-gray-500",
            tasks: tasks.filter((t) => t.status === "todo"),
        },
        {
            title: "In Progress",
            status: "in-progress",
            color: "bg-blue-500",
            tasks: tasks.filter((t) => t.status === "in-progress"),
        },
        {
            title: "Completed",
            status: "completed",
            color: "bg-green-500",
            tasks: tasks.filter((t) => t.status === "completed"),
        },
    ];

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetStatus: string) => {
        e.preventDefault();
        
        const taskId = draggedTaskIdRef.current;
        if (!taskId) return;

        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        if (task.status !== targetStatus) {
            updateTaskMutation.mutate({
                taskId: taskId,
                status: targetStatus,
            });
        }
    };

    return (
        <div className="h-full overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
                {columns.map((column) => (
                    <div
                        key={column.status}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.status)}
                        className="flex-1"
                    >
                        <KanbanColumn
                            title={column.title}
                            status={column.status}
                            tasks={column.tasks}
                            onEditTask={onEditTask}
                            onNewTask={onNewTask}
                            color={column.color}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}