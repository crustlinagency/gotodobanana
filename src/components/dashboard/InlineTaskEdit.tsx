import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Task } from "@/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface InlineTaskEditProps {
  task: any;
  onCancel: () => void;
}

export default function InlineTaskEdit({ task, onCancel }: InlineTaskEditProps) {
  const [title, setTitle] = useState(task.title);
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async (newTitle: string) => {
      await Task.update(task.id, { title: newTitle });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated");
      onCancel();
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  const handleSave = () => {
    if (title.trim() && title !== task.title) {
      updateTaskMutation.mutate(title.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-2 flex-1">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-8 text-sm"
        autoFocus
        onBlur={handleSave}
      />
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 flex-shrink-0"
        onClick={handleSave}
      >
        <Check className="h-4 w-4 text-green-600" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 flex-shrink-0"
        onClick={onCancel}
      >
        <X className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
}