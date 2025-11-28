import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Task } from "@/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Flag, X, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import TaskComments from "./TaskComments";
import TaskAttachments from "./TaskAttachments";
import TaskSubtasks from "./TaskSubtasks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface TaskDetailViewProps {
    task: any;
    open: boolean;
    onClose: () => void;
    onEdit: () => void;
}

export default function TaskDetailView({ task, open, onClose, onEdit }: TaskDetailViewProps) {
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
            toast.success(task.completed ? "Task reopened" : "Task completed! 🎉");
        },
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "High":
                return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300";
            case "Medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300";
            case "Low":
                return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300";
            default:
                return "";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
            case "in-progress":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
        }
    };

    const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                            <DialogTitle className="text-2xl pr-8">{task.title}</DialogTitle>
                            
                            <div className="flex flex-wrap items-center gap-2">
                                {task.priority && (
                                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                        <Flag className="h-3 w-3 mr-1" />
                                        {task.priority}
                                    </Badge>
                                )}
                                
                                {task.status && (
                                    <Badge className={getStatusColor(task.status)}>
                                        {task.status === "completed" ? (
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                        ) : (
                                            <Circle className="h-3 w-3 mr-1" />
                                        )}
                                        {task.status.replace("-", " ").toUpperCase()}
                                    </Badge>
                                )}

                                {task.tags && task.tags.length > 0 && (
                                    <>
                                        {task.tags.map((tag: string, index: number) => (
                                            <Badge key={index} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                {task.dueDate && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                                            Due {format(new Date(task.dueDate), "MMM d, yyyy")}
                                            {isOverdue && " (Overdue)"}
                                        </span>
                                    </div>
                                )}
                                {task.created_at && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>Created {format(new Date(task.created_at), "MMM d, yyyy")}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => toggleCompleteMutation.mutate()}
                            variant={task.completed ? "outline" : "default"}
                            className={!task.completed ? "bg-banana-500 hover:bg-banana-600 text-black" : ""}
                        >
                            {task.completed ? (
                                <>
                                    <Circle className="h-4 w-4 mr-2" />
                                    Reopen Task
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark Complete
                                </>
                            )}
                        </Button>
                        <Button onClick={onEdit} variant="outline">
                            Edit Task
                        </Button>
                    </div>
                </DialogHeader>

                <Separator />

                {task.description && (
                    <div className="space-y-2">
                        <h3 className="font-semibold">Description</h3>
                        <div
                            className="prose prose-sm max-w-none text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: task.description }}
                        />
                    </div>
                )}

                <Tabs defaultValue="subtasks" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
                        <TabsTrigger value="attachments">Attachments</TabsTrigger>
                        <TabsTrigger value="comments">Comments</TabsTrigger>
                    </TabsList>

                    <TabsContent value="subtasks" className="mt-4">
                        <TaskSubtasks taskId={task.id} />
                    </TabsContent>

                    <TabsContent value="attachments" className="mt-4">
                        <TaskAttachments taskId={task.id} />
                    </TabsContent>

                    <TabsContent value="comments" className="mt-4">
                        <TaskComments taskId={task.id} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}