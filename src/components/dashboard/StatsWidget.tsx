import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, Target, TrendingUp } from "lucide-react";

interface StatsWidgetProps {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  todayTasks: number;
}

export default function StatsWidget({
  totalTasks,
  completedTasks,
  overdueTasks,
  todayTasks,
}: StatsWidgetProps) {
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: <Target className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Due Today",
      value: todayTasks,
      icon: <Clock className="h-5 w-5" />,
      color: "text-banana-600",
      bgColor: "bg-banana-100 dark:bg-banana-900/30",
    },
    {
      label: "Overdue",
      value: overdueTasks,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className={`${stat.bgColor} p-2 rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
}