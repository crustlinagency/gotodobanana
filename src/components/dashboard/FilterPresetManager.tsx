import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { FilterPreset } from "@/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, BookmarkPlus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

interface FilterPresetManagerProps {
  currentFilters: any;
  onLoadPreset: (filters: any) => void;
}

export default function FilterPresetManager({ 
  currentFilters, 
  onLoadPreset 
}: FilterPresetManagerProps) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const queryClient = useQueryClient();

  const { data: presets = [] } = useQuery({
    queryKey: ["filter-presets"],
    queryFn: async () => {
      try {
        return await FilterPreset.list("-created_at");
      } catch (error) {
        console.error("Error fetching presets:", error);
        return [];
      }
    },
  });

  const savePresetMutation = useMutation({
    mutationFn: async () => {
      if (!presetName.trim()) {
        throw new Error("Please enter a preset name");
      }
      await FilterPreset.create({
        name: presetName,
        filters: currentFilters,
        isDefault: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filter-presets"] });
      setIsSaveDialogOpen(false);
      setPresetName("");
      toast.success("Filter preset saved!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save preset");
    },
  });

  const deletePresetMutation = useMutation({
    mutationFn: async (presetId: string) => {
      await FilterPreset.delete(presetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filter-presets"] });
      toast.success("Preset deleted");
    },
  });

  const handleSave = () => {
    savePresetMutation.mutate();
  };

  const hasActiveFilters = Object.keys(currentFilters).some(
    key => currentFilters[key] && currentFilters[key] !== "all"
  );

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSaveDialogOpen(true)}
          disabled={!hasActiveFilters}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Filter
        </Button>

        {presets.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Saved Filters
                <Badge variant="secondary" className="ml-2">
                  {presets.length}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {presets.map((preset: any) => (
                <DropdownMenuItem
                  key={preset.id}
                  className="flex items-center justify-between"
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <button
                    className="flex-1 text-left"
                    onClick={() => {
                      onLoadPreset(preset.filters);
                      toast.success(`Loaded "${preset.name}"`);
                    }}
                  >
                    <Star className="h-3 w-3 mr-2 inline" />
                    {preset.name}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${preset.name}"?`)) {
                        deletePresetMutation.mutate(preset.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Give your filter combination a name so you can quickly apply it later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g., High Priority This Week"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!presetName.trim() || savePresetMutation.isPending}
            >
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}