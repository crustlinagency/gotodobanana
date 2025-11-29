import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Comment, Task, User } from "@/entities";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

interface TaskCommentsProps {
    taskId: string;
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
    const [newComment, setNewComment] = useState("");
    const queryClient = useQueryClient();

    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: async () => await User.me(),
    });

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ["comments", taskId],
        queryFn: async () => {
            try {
                // CRITICAL: Verify task belongs to current user before loading comments
                const user = await User.me();
                if (!user?.email) {
                    console.error("No authenticated user found");
                    return [];
                }

                // Verify the task belongs to this user
                const taskResult = await Task.filter({ 
                    id: taskId,
                    created_by: user.email 
                });
                
                if (!taskResult || taskResult.length === 0) {
                    console.error("Task not found or doesn't belong to user");
                    return [];
                }

                const result = await Comment.filter({ taskId }, "-created_at");
                return result || [];
            } catch (error) {
                console.error("Error fetching comments:", error);
                return [];
            }
        },
    });

    const addCommentMutation = useMutation({
        mutationFn: async (content: string) => {
            await Comment.create({
                taskId,
                content,
                timestamp: new Date().toISOString(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
            setNewComment("");
            toast.success("Comment added");
        },
        onError: (error) => {
            console.error("Error adding comment:", error);
            toast.error("Failed to add comment");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            addCommentMutation.mutate(newComment);
        }
    };

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">
                    Comments ({comments.length})
                </h3>
            </div>

            {/* Comment List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No comments yet. Be the first to comment!
                    </p>
                ) : (
                    comments.map((comment: any) => (
                        <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-banana-500 text-black">
                                    {getInitials(comment.created_by || "U")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                        {comment.created_by}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.timestamp), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="space-y-2">
                <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="resize-none"
                />
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!newComment.trim() || addCommentMutation.isPending}
                        className="bg-banana-500 hover:bg-banana-600 text-black"
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Comment
                    </Button>
                </div>
            </form>
        </div>
    );
}