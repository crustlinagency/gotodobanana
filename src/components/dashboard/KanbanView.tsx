import KanbanColumn from "./KanbanColumn";
import { Task, User } from "@/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface KanbanViewProps {
    tasks: any[];
    onEditTask: (task: any) => void;
    onNewTask: () => void;
}

export default function KanbanView({ tasks, onEditTask, onNewTask }: KanbanViewProps) {
    const queryClient = useQueryClient();
    const draggedTaskRef = useRef<any>(null);
    const contentScrollRef = useRef<HTMLDivElement>(null);
    const stickyScrollRef = useRef<HTMLDivElement>(null);
    const [scrollWidth, setScrollWidth] = useState(0);

    const updateTaskMutation = useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
            // CRITICAL: Verify task ownership before update
            const user = await User.me();
            if (!user?.email) {
                throw new Error("Not authenticated");
            }

            const existingTask = await Task.filter({ 
                id: taskId, 
                created_by: user.email 
            });

            if (!existingTask || existingTask.length === 0) {
                throw new Error("Task not found or access denied");
            }

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
        onError: (error: any) => {
            console.error("Error updating task:", error);
            toast.error(error.message || "Failed to move task");
        },
    });

    // Sync scroll between content and sticky scrollbar
    useEffect(() => {
        const contentScroll = contentScrollRef.current;
        const stickyScroll = stickyScrollRef.current;

        if (!contentScroll || !stickyScroll) return;

        const updateScrollWidth = () => {
            const scrollWidth = contentScroll.scrollWidth - contentScroll.clientWidth;
            setScrollWidth(scrollWidth);
        };

        updateScrollWidth();
        window.addEventListener("resize", updateScrollWidth);

        const handleContentScroll = () => {
            if (stickyScroll) {
                stickyScroll.scrollLeft = contentScroll.scrollLeft;
            }
        };

        const handleStickyScroll = () => {
            if (contentScroll) {
                contentScroll.scrollLeft = stickyScroll.scrollLeft;
            }
        };

        contentScroll.addEventListener("scroll", handleContentScroll);
        stickyScroll.addEventListener("scroll", handleStickyScroll);

        return () => {
            window.removeEventListener("resize", updateScrollWidth);
            contentScroll.removeEventListener("scroll", handleContentScroll);
            stickyScroll.removeEventListener("scroll", handleStickyScroll);
        };
    }, []);

    const handleDragStart = (task: any) => {
        draggedTaskRef.current = task;
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetStatus: string) => {
        e.preventDefault();
        
        const task = draggedTaskRef.current;
        if (!task) return;

        if (task.status !== targetStatus) {
            updateTaskMutation.mutate({
                taskId: task.id,
                status: targetStatus,
            });
        }
        
        draggedTaskRef.current = null;
    };

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

    return (
        <div className="relative">
            <div 
                ref={contentScrollRef}
                className="overflow-x-auto pb-4"
                style={{ maxHeight: "calc(100vh - 300px)" }}
            >
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
                                onDragStart={handleDragStart}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {scrollWidth > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t">
                    <div 
                        ref={stickyScrollRef}
                        className="overflow-x-auto py-2"
                        style={{ 
                            width: "100%",
                            overflowY: "hidden"
                        }}
                    >
                        <div 
                            style={{ 
                                width: `${scrollWidth + (contentScrollRef.current?.clientWidth || 0)}px`,
                                height: "1px"
                            }} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}