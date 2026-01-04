import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, Note } from "@/entities";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TrashView() {
    const { data: user } = useUser();
    const queryClient = useQueryClient();
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: deletedItems = [], isLoading } = useQuery({
        queryKey: ["deletedItems", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            console.log("✅ SECURITY: Fetching deleted items for userId:", user.id);
            
            const [tasks, notes] = await Promise.all([
                Task.filter({ deleted: true, userId: user.id }, "-deletedAt"),
                Note.filter({ deleted: true, userId: user.id }, "-deletedAt")
            ]);
            
            const taskItems = (tasks || []).map((t: any) => ({ ...t, type: "task" }));
            const noteItems = (notes || []).map((n: any) => ({ ...n, type: "note" }));
            
            const combined = [...taskItems, ...noteItems].sort((a, b) => {
                const dateA = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
                const dateB = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
                return dateB - dateA;
            });

            console.log("✅ SECURITY: Found deleted items:", combined.length);
            return combined;
        },
        enabled: !!user?.id,
    });

    const restoreMutation = useMutation({
        mutationFn: async (item: any) => {
            console.log(`🔄 Restoring ${item.type}:`, item.id);
            if (item.type === "task") {
                await Task.update(item.id, {
                    deleted: false,
                    deletedAt: null,
                });
            } else {
                await Note.update(item.id, {
                    deleted: false,
                    deletedAt: null,
                });
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["deletedItems"] });
            if (variables.type === "task") {
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
                queryClient.invalidateQueries({ queryKey: ["deletedTasksCount"] });
            } else {
                queryClient.invalidateQueries({ queryKey: ["notes"] });
            }
            toast.success(`${variables.type === "task" ? "Task" : "Note"} restored successfully`);
        },
        onError: (error: any, variables) => {
            console.error(`❌ Error restoring ${variables.type}:`, error);
            toast.error(`Failed to restore ${variables.type}`);
        },
    });

    const permanentDeleteMutation = useMutation({
        mutationFn: async (item: any) => {
            console.log(`🗑️ PERMANENTLY deleting ${item.type} from database:`, item.id);
            if (item.type === "task") {
                await Task.delete(item.id);
            } else {
                await Note.delete(item.id);
            }
            console.log(`✅ ${item.type} permanently removed from database`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["deletedItems"] });
            if (variables.type === "task") {
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
                queryClient.invalidateQueries({ queryKey: ["deletedTasksCount"] });
            } else {
                queryClient.invalidateQueries({ queryKey: ["notes"] });
            }
            toast.success(`${variables.type === "task" ? "Task" : "Note"} permanently deleted`);
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        },
        onError: (error: any, variables) => {
            console.error(`❌ Error permanently deleting ${variables.type}:`, error);
            toast.error(`Failed to permanently delete ${variables.type}`);
        },
    });

    const handleRestore = (item: any) => {
        if (!restoreMutation.isPending) {
            restoreMutation.mutate(item);
        }
    };

    const handlePermanentDelete = (item: any) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    };

    const confirmPermanentDelete = () => {
        if (itemToDelete && !permanentDeleteMutation.isPending) {
            permanentDeleteMutation.mutate(itemToDelete);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-banana-600" />
            </div>
        );
    }

    if (deletedItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Trash2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Trash is empty</h3>
                <p className="text-muted-foreground">
                    Deleted items will appear here before being permanently removed
                </p>
            </div>
        );
    }

    const isAnyActionPending = restoreMutation.isPending || permanentDeleteMutation.isPending;

    return (
        <div className="space-y-6">
            <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <CardTitle>Trash</CardTitle>
                    </div>
                    <CardDescription>
                        {deletedItems.length} {deletedItems.length === 1 ? "item" : "items"} in trash. 
                        Restore or permanently delete items.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-4">
                {deletedItems.map((item: any) => (
                    <Card key={`${item.type}-${item.id}`} className="border-muted">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg line-through text-muted-foreground">
                                            {item.title}
                                        </h3>
                                        <Badge variant="secondary" className="text-[10px] uppercase">
                                            {item.type}
                                        </Badge>
                                        {item.priority && (
                                            <Badge
                                                variant="outline"
                                                className={
                                                    item.priority === "High"
                                                        ? "priority-high"
                                                        : item.priority === "Medium"
                                                        ? "priority-medium"
                                                        : "priority-low"
                                                }
                                            >
                                                {item.priority}
                                            </Badge>
                                        )}
                                    </div>
                                    {(item.description || item.content) && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {item.description || "Note content..."}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        {item.deletedAt && (
                                            <span>
                                                Deleted {formatDistanceToNow(new Date(item.deletedAt), { addSuffix: true })}
                                            </span>
                                        )}
                                        {item.tags && item.tags.length > 0 && (
                                            <div className="flex gap-1">
                                                {item.tags.map((tag: string, index: number) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRestore(item)}
                                        disabled={isAnyActionPending}
                                    >
                                        {restoreMutation.isPending && restoreMutation.variables?.id === item.id ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                            <RotateCcw className="h-4 w-4 mr-1" />
                                        )}
                                        Restore
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handlePermanentDelete(item)}
                                        disabled={isAnyActionPending}
                                    >
                                        {permanentDeleteMutation.isPending && permanentDeleteMutation.variables?.id === item.id ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4 mr-1" />
                                        )}
                                        Delete Forever
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
                if (!open && !permanentDeleteMutation.isPending) {
                    setIsDeleteDialogOpen(false);
                    setItemToDelete(null);
                }
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently Delete {itemToDelete?.type === "task" ? "Task" : "Note"}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The {itemToDelete?.type} "{itemToDelete?.title}" will be 
                            permanently removed from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={permanentDeleteMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmPermanentDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={permanentDeleteMutation.isPending}
                        >
                            {permanentDeleteMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Forever"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}