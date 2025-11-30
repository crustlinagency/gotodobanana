import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Tag as TagIcon, 
  Trash2, 
  Edit,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import RichTextEditor from "./RichTextEditor";
import TaskComments from "./TaskComments";
import TaskSubtasks from "./TaskSubtasks";
import TaskAttachments from "./TaskAttachments";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface TaskDetailViewProps {
  task: any;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskDetailView({ task, open, onClose, onEdit, onDelete }: TaskDetailViewProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete();
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
      setShowDeleteDialog(false);
    }
  };

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return dateString;
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <DialogTitle className="text-2xl pr-8">{task.title}</DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <Badge className={getStatusColor(task.status)}>
                  {task.status || 'To Do'}
                </Badge>
              </div>

              {task.priority && (
                <Badge variant={getPriorityColor(task.priority)}>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {task.priority} Priority
                </Badge>
              )}

              {task.dueDate && (
                <Badge variant={isOverdue ? "destructive" : "outline"}>
                  <Calendar className="h-3 w-3 mr-1" />
                  Due: {formatDate(task.dueDate)}
                </Badge>
              )}

              {task.startDate && (
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  Start: {formatDate(task.startDate)}
                </Badge>
              )}
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                {task.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </DialogHeader>

          <Separator className="my-4" />

          <div className="space-y-6">
            {task.description && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Description</h3>
                <RichTextEditor 
                  content={task.description} 
                  readOnly={true}
                />
              </div>
            )}

            <TaskSubtasks taskId={task.id} />

            <TaskAttachments taskId={task.id} />

            <TaskComments taskId={task.id} />
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </>
  );
}