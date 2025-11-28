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
import { Task, List } from "@/entities";
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

  const queryClient = useQueryClient();

  const { data: lists = [] } = useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      const result = await List.filter({ archived: false }, "-created_at");
      return result || [];
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
    } else {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setStatus("todo");
      setDueDate(undefined);
      setListId(defaultListId || "none");
      setTags("");
    }
  }, [task, defaultListId]);

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return await Task.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created");
      handleClose();
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
  });

  const softDeleteMutation = useMutation({
    mutationFn: async () => {
      await Task.update(task.id, {
        deleted: true,
        deletedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task moved to trash");
      handleClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
    };

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
    onClose();
  };

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
                Comments {task && `(${0})`}
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
          setShowDeleteDialog(false);
        }}
        itemName={task?.title}
      />
    </>
  );
}