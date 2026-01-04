import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Comment, User } from "@/entities";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

interface TaskCommentsProps {
  taskId?: string;
  noteId?: string;
}

export default function TaskComments({ taskId, noteId }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();
  
  const targetId = taskId || noteId;
  const targetType = taskId ? "task" : "note";

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const user = await User.me();
      return user;
    },
  });

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", targetId],
    queryFn: async () => {
      try {
        if (!targetId) return [];
        console.log(`✅ SECURITY: Fetching comments for ${targetType}:`, targetId);
        const filter = taskId ? { taskId } : { noteId };
        const result = await Comment.filter(filter, "-created_at");
        console.log(`✅ SECURITY: Found ${result?.length || 0} comments`);
        return result || [];
      } catch (error) {
        console.error("❌ SECURITY: Error fetching comments:", error);
        return [];
      }
    },
    enabled: !!targetId,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      console.log("✅ SECURITY: Creating comment with userId:", user.id);
      return await Comment.create({
        taskId,
        noteId,
        userId: user.id, // CRITICAL: Use userId
        content,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", targetId] });
      setNewComment("");
      toast.success("Comment added");
    },
    onError: (error: any) => {
      console.error("❌ SECURITY: Error creating comment:", error);
      toast.error("Failed to add comment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-banana-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || createCommentMutation.isPending}
            className="bg-banana-500 hover:bg-banana-600 text-black"
          >
            {createCommentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Add Comment
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {comment.created_by?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {comment.created_by || "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.timestamp), "PPp")}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}