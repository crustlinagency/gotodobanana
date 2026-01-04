import { useLists } from "@/hooks/use-lists";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Inbox, Trash2, FolderOpen, BarChart3, Settings, Shield, Loader2, X, FileText } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { List, User } from "@/entities";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface SidebarProps {
  selectedListId: string | null;
  onSelectList: (listId: string | null) => void;
  onSelectTrash: () => void;
  isTrashSelected: boolean;
  isNotesSelected: boolean;
  onSelectNotes: () => void;
}

export default function Sidebar({
  selectedListId,
  onSelectList,
  onSelectTrash,
  isTrashSelected,
  isNotesSelected,
  onSelectNotes,
}: SidebarProps) {
  const { data: lists = [] } = useLists();
  const [isNewListDialogOpen, setIsNewListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [listToDelete, setListToDelete] = useState<any>(null);
  const [hoveredListId, setHoveredListId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const user = await User.me();
      return user;
    },
  });

  const { data: deletedTasksCount = 0 } = useQuery({
    queryKey: ["deletedTasksCount"],
    queryFn: async () => {
      try {
        if (!user?.id) return 0;
        
        const { Task } = await import("@/entities");
        const result = await Task.filter({ 
          deleted: true,
          userId: user.id
        });
        return result?.length || 0;
      } catch (error) {
        console.error("Error fetching deleted tasks count:", error);
        return 0;
      }
    },
    enabled: !!user,
  });

  const createListMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      console.log("✅ SECURITY: Creating list with userId:", user.id);
      return await List.create({
        userId: user.id,
        name: newListName,
        description: newListDescription,
        color: "#FFD93D",
        archived: false,
        order: lists.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      setNewListName("");
      setNewListDescription("");
      setIsNewListDialogOpen(false);
      toast.success("List created successfully");
    },
    onError: (error: any) => {
      console.error("❌ SECURITY: Error creating list:", error);
      toast.error("Failed to create list");
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (listId: string) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      console.log("✅ SECURITY: Deleting list:", listId);
      
      // Archive the list instead of deleting it
      await List.update(listId, {
        archived: true,
      });
      
      // Also update any tasks in this list to have no list
      const { Task } = await import("@/entities");
      const tasksInList = await Task.filter({ 
        listId: listId,
        userId: user.id
      });
      
      if (tasksInList && tasksInList.length > 0) {
        for (const task of tasksInList) {
          await Task.update(task.id, { listId: null });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("List deleted successfully");
      setListToDelete(null);
      
      // If the deleted list was selected, deselect it
      if (selectedListId === listToDelete?.id) {
        onSelectList(null);
      }
    },
    onError: (error: any) => {
      console.error("❌ Error deleting list:", error);
      toast.error("Failed to delete list");
      setListToDelete(null);
    },
  });

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim() && !createListMutation.isPending) {
      createListMutation.mutate();
    }
  };

  const handleCloseDialog = () => {
    if (!createListMutation.isPending) {
      setNewListName("");
      setNewListDescription("");
      setIsNewListDialogOpen(false);
    }
  };

  const isAdmin = user?.role === "administrator";

  return (
    <>
      <div className="flex flex-col h-full border-r bg-muted/30">
        <div className="p-4 border-b">
          <Button
            onClick={() => setIsNewListDialogOpen(true)}
            className="w-full bg-banana-500 hover:bg-banana-600 text-black"
            disabled={createListMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            New List
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <Button
              variant={!selectedListId && !isTrashSelected && !isNotesSelected ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectList(null)}
            >
              <Inbox className="h-4 w-4 mr-2" />
              All Tasks
            </Button>

            <Button
              variant={isNotesSelected ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={onSelectNotes}
            >
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </Button>

            {lists.map((list: any) => (
              <div
                key={list.id}
                className="relative group"
                onMouseEnter={() => setHoveredListId(list.id)}
                onMouseLeave={() => setHoveredListId(null)}
              >
                <Button
                  variant={selectedListId === list.id ? "secondary" : "ghost"}
                  className="w-full justify-start pr-10"
                  onClick={() => onSelectList(list.id)}
                >
                  <FolderOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{list.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity ${
                    hoveredListId === list.id ? "opacity-100" : "opacity-0"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setListToDelete(list);
                  }}
                  disabled={deleteListMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              variant={isTrashSelected ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={onSelectTrash}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Trash
              {deletedTasksCount > 0 && (
                <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">
                  {deletedTasksCount}
                </span>
              )}
            </Button>

            <Separator className="my-2" />

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/analytics")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>

            {isAdmin && (
              <>
                <Separator className="my-2" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-banana-600 hover:text-banana-700 hover:bg-banana-500/10"
                  onClick={() => navigate("/admin")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={isNewListDialogOpen} onOpenChange={(open) => {
        if (!open && !createListMutation.isPending) {
          handleCloseDialog();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateList} className="space-y-4">
            <div>
              <Label htmlFor="listName">List Name *</Label>
              <Input
                id="listName"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., Work, Personal, Shopping"
                required
                disabled={createListMutation.isPending}
              />
            </div>
            <div>
              <Label htmlFor="listDescription">Description</Label>
              <Input
                id="listDescription"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Optional description"
                disabled={createListMutation.isPending}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={createListMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-banana-500 hover:bg-banana-600 text-black"
                disabled={!newListName.trim() || createListMutation.isPending}
              >
                {createListMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create List"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!listToDelete}
        onClose={() => setListToDelete(null)}
        onConfirm={() => {
          if (listToDelete) {
            deleteListMutation.mutate(listToDelete.id);
          }
        }}
        itemName={listToDelete?.name}
        itemType="list"
      />
    </>
  );
}