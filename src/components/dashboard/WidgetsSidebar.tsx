import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsWidget from "./StatsWidget";
import WeeklyProductivity from "./WeeklyProductivity";
import RecentActivityFeed from "./RecentActivityFeed";
import { TrendingUp } from "lucide-react";

interface WidgetsSidebarProps {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  todayTasks: number;
  tasks: any[];
}

export default function WidgetsSidebar({
  totalTasks,
  completedTasks,
  overdueTasks,
  todayTasks,
  tasks,
}: WidgetsSidebarProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-banana-600" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatsWidget
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            overdueTasks={overdueTasks}
            todayTasks={todayTasks}
          />
        </CardContent>
      </Card>

      <WeeklyProductivity tasks={tasks} />
      <RecentActivityFeed tasks={tasks} />
    </div>
  );
}