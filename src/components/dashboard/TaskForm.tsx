import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task, List, User } from "@/entities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import TaskComments from "./TaskComments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import RecurrenceSettings from "./RecurrenceSettings";
import { toast } from "sonner";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task?: any;
  defaultListId?: string;
}

export default function TaskForm({ open, onClose, task, defaultListId }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [listId, setListId] = useState(defaultListId || "none");
  const [tags, setTags] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState("weekly");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>();

  const queryClient = useQueryClient();

  const { data: lists = [] } = useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      try {
        // CRITICAL: Filter lists by current user
        const user = await User.me();
        if (!user?.email) {
          console.error("No authenticated user found");
          return [];
        }

        console.log("Fetching lists for task form for user:", user.email);
        
        const result = await List.filter({ 
          archived: false,
          created_by: user.email // CRITICAL: Filter by current user
        }, "-created_at");
        
        console.log(`Found ${result?.length || 0} lists for user`);
        return result || [];
      } catch (error) {
        console.error("Error fetching lists:", error);
        return [];
      }
    },
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "Medium");
      setStatus(task.status || "todo");
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setListId(task.listId || "none");
      setTags(task.tags ? task.tags.join(", ") : "");
      
      setIsRecurring(task.isRecurring || false);
      setRecurrencePattern(task.recurrencePattern || "weekly");
      setRecurrenceInterval(task.recurrenceInterval || 1);
      setRecurrenceDays(task.recurrenceDays || []);
      setRecurrenceEndDate(task.recurrenceEndDate ? new Date(task.recurrenceEndDate) : undefined);
    } else {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setStatus("todo");
      setDueDate(undefined);
      setListId(defaultListId || "none");
      setTags("");
      
      setIsRecurring(false);
      setRecurrencePattern("weekly");
      setRecurrenceInterval(1);
      setRecurrenceDays([]);
      setRecurrenceEndDate(undefined);
    }
  }, [task, defaultListId]);

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating task with data:", data);
      const result = await Task.create(data);
      console.log("Task created successfully:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Task creation succeeded, invalidating queries...");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created");
      handleClose();
    },
    onError: (error: any) => {
      console.error("Error creating task:", error);
      toast.error("Failed to create task. Please try again.");
      // Close dialog on auth errors
      if (error?.message?.includes("auth") || error?.message?.includes("JWT")) {
        handleClose();
      }
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return await Task.update(task.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated");
      handleClose();
    },
    onError: (error: any) => {
      console.error("Error updating task:", error);
      toast.error("Failed to update task. It may have been deleted.");
      handleClose();
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: async () => {
      if (!task?.id) {
        throw new Error("Task not found");
      }
      await Task.update(task.id, {
        deleted: true,
        deletedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["deletedTasksCount"] });
      toast.success("Task moved to trash");
      setShowDeleteDialog(false);
      handleClose();
    },
    onError: (error: any) => {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task. It may have already been removed.");
      setShowDeleteDialog(false);
      handleClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Attempting to create task with title:", title);

    const taskData = {
      title,
      description,
      priority,
      status,
      dueDate: dueDate ? dueDate.toISOString() : null,
      listId: listId === "none" ? null : listId,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      completed: false,
      order: 0,
      deleted: false,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : null,
      recurrenceInterval: isRecurring ? recurrenceInterval : null,
      recurrenceDays: isRecurring && recurrencePattern === 'weekly' ? recurrenceDays : [],
      recurrenceEndDate: isRecurring && recurrenceEndDate ? recurrenceEndDate.toISOString() : null,
      parentRecurringTaskId: null,
    };

    console.log("Task data prepared:", taskData);

    if (task) {
      updateTaskMutation.mutate(taskData);
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setStatus("todo");
    setDueDate(undefined);
    setListId(defaultListId || "none");
    setTags("");
    setIsRecurring(false);
    setRecurrencePattern("weekly");
    setRecurrenceInterval(1);
    setRecurrenceDays([]);
    setRecurrenceEndDate(undefined);
    setShowDeleteDialog(false);
    onClose();
  };

  // Close form if authentication fails
  useEffect(() => {
    if (open) {
      User.me().catch(() => {
        console.log("Auth check failed, closing form");
        handleClose();
      });
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
              {task && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments" disabled={!task}>
                Comments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Add details about this task..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="list">List</Label>
                    <Select value={listId} onValueChange={setListId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select list" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No List</SelectItem>
                        {lists.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            {list.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="work, urgent, personal"
                  />
                </div>

                <RecurrenceSettings
                  isRecurring={isRecurring}
                  onIsRecurringChange={setIsRecurring}
                  pattern={recurrencePattern}
                  onPatternChange={setRecurrencePattern}
                  interval={recurrenceInterval}
                  onIntervalChange={setRecurrenceInterval}
                  days={recurrenceDays}
                  onDaysChange={setRecurrenceDays}
                  endDate={recurrenceEndDate}
                  onEndDateChange={setRecurrenceEndDate}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-banana-500 hover:bg-banana-600 text-black"
                    disabled={!title.trim()}
                  >
                    {task ? "Update Task" : "Create Task"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="comments">
              {task && (
                <div className="py-4">
                  <TaskComments taskId={task.id} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          softDeleteMutation.mutate();
        }}
        itemName={task?.title}
      />
    </>
  );
}