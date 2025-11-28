import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import TaskCard from "./TaskCard";

interface TaskGroupViewProps {
  tasks: any[];
  groupBy: "list" | "priority" | "dueDate" | "status" | "none";
  onEditTask: (task: any) => void;
  lists?: any[];
}

export default function TaskGroupView({ 
  tasks, 
  groupBy, 
  onEditTask,
  lists = [] 
}: TaskGroupViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const groupTasks = () => {
    if (groupBy === "none") {
      return { "All Tasks": tasks };
    }

    const groups: Record<string, any[]> = {};

    tasks.forEach((task) => {
      let groupKey = "Uncategorized";

      switch (groupBy) {
        case "list":
          if (task.listId) {
            const list = lists.find((l) => l.id === task.listId);
            groupKey = list?.name || "Uncategorized";
          }
          break;
        case "priority":
          groupKey = task.priority || "No Priority";
          break;
        case "status":
          groupKey = task.status === "todo" ? "To Do" 
            : task.status === "in-progress" ? "In Progress"
            : task.status === "completed" ? "Completed"
            : "No Status";
          break;
        case "dueDate":
          if (task.dueDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate < today) {
              groupKey = "Overdue";
            } else if (dueDate.getTime() === today.getTime()) {
              groupKey = "Today";
            } else if (dueDate.getTime() === new Date(today.getTime() + 86400000).getTime()) {
              groupKey = "Tomorrow";
            } else if (dueDate.getTime() < new Date(today.getTime() + 7 * 86400000).getTime()) {
              groupKey = "This Week";
            } else {
              groupKey = "Later";
            }
          } else {
            groupKey = "No Due Date";
          }
          break;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
    });

    return groups;
  };

  const groups = groupTasks();
  const groupKeys = Object.keys(groups).sort();

  const getPriorityOrder = (key: string) => {
    const order: Record<string, number> = {
      "High": 0,
      "Medium": 1,
      "Low": 2,
      "No Priority": 3,
    };
    return order[key] ?? 4;
  };

  const getDueDateOrder = (key: string) => {
    const order: Record<string, number> = {
      "Overdue": 0,
      "Today": 1,
      "Tomorrow": 2,
      "This Week": 3,
      "Later": 4,
      "No Due Date": 5,
    };
    return order[key] ?? 6;
  };

  const getStatusOrder = (key: string) => {
    const order: Record<string, number> = {
      "To Do": 0,
      "In Progress": 1,
      "Completed": 2,
      "No Status": 3,
    };
    return order[key] ?? 4;
  };

  const sortedGroupKeys = [...groupKeys].sort((a, b) => {
    if (groupBy === "priority") {
      return getPriorityOrder(a) - getPriorityOrder(b);
    } else if (groupBy === "dueDate") {
      return getDueDateOrder(a) - getDueDateOrder(b);
    } else if (groupBy === "status") {
      return getStatusOrder(a) - getStatusOrder(b);
    }
    return a.localeCompare(b);
  });

  if (groupBy === "none") {
    return (
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEditTask} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedGroupKeys.map((groupKey) => {
        const groupTasks = groups[groupKey];
        const isCollapsed = collapsedGroups.has(groupKey);

        return (
          <div key={groupKey} className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleGroup(groupKey)}
                className="gap-2"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="font-semibold">{groupKey}</span>
                <span className="text-xs text-muted-foreground">
                  ({groupTasks.length})
                </span>
              </Button>
            </div>

            {!isCollapsed && (
              <div className="space-y-3 pl-6">
                {groupTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={onEditTask} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}