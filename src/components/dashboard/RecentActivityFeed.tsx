import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Plus, Edit, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "created" | "completed" | "updated" | "deleted";
  taskTitle: string;
  timestamp: string;
}

interface RecentActivityFeedProps {
  tasks: any[];
}

export default function RecentActivityFeed({ tasks }: RecentActivityFeedProps) {
  const activities: Activity[] = [];

  tasks.forEach((task) => {
    if (task.created_at) {
      activities.push({
        id: `${task.id}-created`,
        type: "created",
        taskTitle: task.title,
        timestamp: task.created_at,
      });
    }
    
    if (task.completedAt) {
      activities.push({
        id: `${task.id}-completed`,
        type: "completed",
        taskTitle: task.title,
        timestamp: task.completedAt,
      });
    }
    
    if (task.updated_at && task.updated_at !== task.created_at) {
      activities.push({
        id: `${task.id}-updated`,
        type: "updated",
        taskTitle: task.title,
        timestamp: task.updated_at,
      });
    }
  });

  const sortedActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "created":
        return <Plus className="h-4 w-4 text-blue-600" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "updated":
        return <Edit className="h-4 w-4 text-banana-600" />;
      case "deleted":
        return <Trash2 className="h-4 w-4 text-red-600" />;
    }
  };

  const getActivityText = (type: Activity["type"]) => {
    switch (type) {
      case "created":
        return "Created";
      case "completed":
        return "Completed";
      case "updated":
        return "Updated";
      case "deleted":
        return "Deleted";
    }
  };

  if (sortedActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity yet. Start creating tasks!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {sortedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-3 border-b last:border-0"
              >
                <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{getActivityText(activity.type)}</span>
                    {" "}
                    <span className="text-muted-foreground truncate">
                      {activity.taskTitle}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}