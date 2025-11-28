import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Edit, Trash2, Tag, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: any;
  onEdit: (task: any) => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const queryClient = useQueryClient();

  const toggleCompleteMutation = useMutation({
    mutationFn: async () => {
      await Task.update(task.id, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null,
        status: !task.completed ? "completed" : task.status || "todo",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      await Task.delete(task.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "High":
        return "priority-high";
      case "Medium":
        return "priority-medium";
      case "Low":
        return "priority-low";
      default:
        return "";
    }
  };

  const isOverdue =
    task.dueDate &&
    !task.completed &&
    new Date(task.dueDate) < new Date();

  return (
    <Card className="p-4 task-card-shadow transition-all duration-200 hover:scale-[1.01]">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => toggleCompleteMutation.mutate()}
          className="mt-1"
        />

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-medium ${
                task.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {task.title}
            </h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm("Delete this task?")) {
                      deleteTaskMutation.mutate();
                    }
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {task.priority && (
              <Badge
                variant="outline"
                className={`${getPriorityClass(task.priority)} text-xs`}
              >
                {task.priority}
              </Badge>
            )}

            {task.dueDate && (
              <Badge
                variant="outline"
                className={`text-xs ${
                  isOverdue
                    ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300"
                    : ""
                }`}
              >
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(task.dueDate), "MMM d")}
                {isOverdue && " (Overdue)"}
              </Badge>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {task.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}