import { Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FocusModeProps {
  isActive: boolean;
  onToggle: () => void;
  filteredTasksCount: number;
  totalTasksCount?: number;
}

export default function FocusMode({ 
  isActive, 
  onToggle, 
  filteredTasksCount,
  totalTasksCount = 0 
}: FocusModeProps) {
  const hiddenCount = totalTasksCount - filteredTasksCount;

  if (!isActive) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="gap-2"
      >
        <Target className="h-4 w-4" />
        Enable Focus Mode
      </Button>
    );
  }

  return (
    <Alert className="border-banana-500 bg-banana-50 dark:bg-banana-950">
      <Target className="h-4 w-4 text-banana-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-semibold text-banana-900 dark:text-banana-100">
            Focus Mode Active
          </span>
          <p className="text-sm text-banana-800 dark:text-banana-200 mt-1">
            Showing only <strong>High priority</strong> incomplete tasks ({filteredTasksCount} tasks)
            {hiddenCount > 0 && (
              <span className="block mt-1 text-banana-700 dark:text-banana-300">
                ⚠️ {hiddenCount} other task{hiddenCount !== 1 ? 's are' : ' is'} hidden
              </span>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="gap-2 hover:bg-banana-100 dark:hover:bg-banana-900"
        >
          <X className="h-4 w-4" />
          Disable
        </Button>
      </AlertDescription>
    </Alert>
  );
}