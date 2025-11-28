import { Card } from "@/components/ui/card";
import KanbanTaskCard from "./KanbanTaskCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
    title: string;
    status: string;
    tasks: any[];
    onEditTask: (task: any) => void;
    onNewTask: () => void;
    color: string;
}

export default function KanbanColumn({
    title,
    status,
    tasks,
    onEditTask,
    onNewTask,
    color,
}: KanbanColumnProps) {
    return (
        <div className="flex-1 min-w-[300px]">
            <Card className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <h3 className="font-semibold">
                            {title}
                            <span className="ml-2 text-sm text-muted-foreground">
                                ({tasks.length})
                            </span>
                        </h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onNewTask}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                    {tasks.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                            No tasks
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task.id} data-task-id={task.id}>
                                <KanbanTaskCard task={task} onClick={onEditTask} />
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}