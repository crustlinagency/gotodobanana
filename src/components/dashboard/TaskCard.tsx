import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Task, User } from "@/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Edit, Trash2, Tag, MoreVertical, GripVertical, ExternalLink, ChevronDown, ChevronUp, Pencil, Repeat } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TaskDetailView from "./TaskDetailView";
import CompletionCelebration from "./CompletionCelebration";
import InlineTaskEdit from "./InlineTaskEdit";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { toast } from "sonner";
import { calculateNextOccurrence, formatRecurrenceDescription } from "@/lib/recurrence-utils";

interface TaskCardProps {
  task: any;
  onEdit: (task: any) => void;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  showSelection?: boolean;
}

export default function TaskCard({ 
  task, 
  onEdit, 
  isSelected = false,
  onSelectChange,
  showSelection = false,
}: TaskCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const toggleCompleteMutation = useMutation({
    mutationFn: async () => {
      // CRITICAL: Verify task ownership before update
      const user = await User.me();
      if (!user?.email) {
        throw new Error("Not authenticated");
      }

      const existingTask = await Task.filter({ 
        id: task.id, 
        created_by: user.email 
      });

      if (!existingTask || existingTask.length === 0) {
        throw new Error("Task not found or access denied");
      }

      const newCompletedState = !task.completed;
      
      await Task.update(task.id, {
        completed: newCompletedState,
        completedAt: newCompletedState ? new Date().toISOString() : null,
        status: newCompletedState ? "completed" : task.status || "todo",
      });
      
      if (newCompletedState && task.isRecurring) {
        const nextDate = calculateNextOccurrence(
          task.dueDate ? new Date(task.dueDate) : new Date(),
          {
            pattern: task.recurrencePattern,
            interval: task.recurrenceInterval,
            days: task.recurrenceDays,
            endDate: task.recurrenceEndDate,
          }
        );

        if (nextDate) {
          await Task.create({
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: "todo",
            dueDate: nextDate.toISOString(),
            listId: task.listId,
            tags: task.tags || [],
            completed: false,
            order: task.order,
            deleted: false,
            isRecurring: true,
            recurrencePattern: task.recurrencePattern,
            recurrenceInterval: task.recurrenceInterval,
            recurrenceDays: task.recurrenceDays || [],
            recurrenceEndDate: task.recurrenceEndDate,
            parentRecurringTaskId: task.parentRecurringTaskId || task.id,
          });
          
          console.log("Created next recurring task instance for:", nextDate);
        } else {
          console.log("Recurring series has ended");
        }
      }
      
      return newCompletedState;
    },
    onSuccess: (wasCompleted) => {
      if (wasCompleted) {
        setIsCompleting(true);
        setShowCelebration(true);
        
        if (task.isRecurring) {
          toast.success("Task completed! Next instance created 🔄", {
            description: task.title,
          });
        } else {
          toast.success("Task completed! 🎉", {
            description: task.title,
          });
        }
        
        setTimeout(() => {
          setIsCompleting(false);
        }, 400);
      }
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      console.error("Error toggling task:", error);
      toast.error(error.message || "Failed to update task");
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: async () => {
      // CRITICAL: Verify task ownership before delete
      const user = await User.me();
      if (!user?.email) {
        throw new Error("Not authenticated");
      }

      const existingTask = await Task.filter({ 
        id: task.id, 
        created_by: user.email 
      });

      if (!existingTask || existingTask.length === 0) {
        throw new Error("Task not found or access denied");
      }

      await Task.update(task.id, {
        deleted: true,
        deletedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task moved to trash");
    },
    onError: (error: any) => {
      console.error("Error deleting task:", error);
      toast.error(error.message || "Failed to delete task");
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

  const recurrenceDescription = task.isRecurring
    ? formatRecurrenceDescription({
        pattern: task.recurrencePattern,
        interval: task.recurrenceInterval,
        days: task.recurrenceDays,
      })
    : null;

  return (
    <>
      <Card 
        className={`p-4 task-card-shadow transition-all duration-200 hover:scale-[1.01] ${
          isSelected ? "ring-2 ring-banana-500 bg-banana-50 dark:bg-banana-950/20" : ""
        } ${isCompleting ? "animate-task-complete" : ""}`}
        data-task-card-id={task.id}
        draggable
      >
        <div className="flex items-start gap-3">
          {showSelection && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => {
                onSelectChange?.(checked as boolean);
              }}
              className="mt-1"
            />
          )}

          <div 
            className="cursor-grab active:cursor-grabbing pt-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          <div className={task.completed ? "animate-checkmark-pop" : ""}>
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleCompleteMutation.mutate()}
              className="mt-1"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {isInlineEditing ? (
                  <InlineTaskEdit
                    task={task}
                    onCancel={() => setIsInlineEditing(false)}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-medium cursor-pointer hover:text-banana-600 transition-colors break-words ${
                        task.completed ? "line-through text-muted-foreground" : ""
                      }`}
                      onClick={() => setIsDetailOpen(true)}
                    >
                      {task.title}
                    </h3>
                    {task.isRecurring && (
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <Repeat className="h-3 w-3" />
                        Recurring
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                      onClick={() => setIsInlineEditing(true)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {(task.description || task.tags?.length > 0 || task.isRecurring) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsDetailOpen(true)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

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
            </div>

            {isExpanded && (
              <div className="space-y-2 pt-2 border-t animate-slide-up">
                {task.isRecurring && recurrenceDescription && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Repeat className="h-4 w-4" />
                    <span>{recurrenceDescription}</span>
                  </div>
                )}
                
                {task.description && (
                  <div 
                    className="text-sm text-muted-foreground prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: task.description }}
                  />
                )}
                
                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {task.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      <CompletionCelebration 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)}
      />

      <TaskDetailView
        task={task}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={() => {
          setIsDetailOpen(false);
          onEdit(task);
        }}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          softDeleteMutation.mutate();
          setShowDeleteDialog(false);
        }}
        itemName={task.title}
      />
    </>
  );
}