import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, TrendingUp, Target } from "lucide-react";

interface StatsCardsProps {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    averageCompletionDays: number;
}

export default function StatsCards({
    totalTasks,
    completedTasks,
    completionRate,
    averageCompletionDays,
}: StatsCardsProps) {
    const stats = [
        {
            title: "Total Tasks",
            value: totalTasks,
            icon: Target,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
            title: "Completed",
            value: completedTasks,
            icon: CheckCircle2,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/30",
        },
        {
            title: "Completion Rate",
            value: `${completionRate}%`,
            icon: TrendingUp,
            color: "text-banana-600",
            bgColor: "bg-banana-100 dark:bg-banana-900/30",
        },
        {
            title: "Avg. Completion Time",
            value: averageCompletionDays > 0 ? `${averageCompletionDays}d` : "N/A",
            icon: Clock,
            color: "text-purple-600",
            bgColor: "bg-purple-100 dark:bg-purple-900/30",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index} className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}