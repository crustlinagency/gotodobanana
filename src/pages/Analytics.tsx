import { useQuery } from "@tanstack/react-query";
import { Task, User } from "@/entities";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import StatsCards from "@/components/analytics/StatsCards";
import CompletionTrendChart from "@/components/analytics/CompletionTrendChart";
import PriorityDistributionChart from "@/components/analytics/PriorityDistributionChart";
import StatusDistributionChart from "@/components/analytics/StatusDistributionChart";
import { subDays, format, differenceInDays } from "date-fns";

export default function Analytics() {
    const navigate = useNavigate();
    const { data: user, isLoading: userLoading } = useUser();

    const { data: tasks = [], isLoading: tasksLoading } = useQuery({
        queryKey: ["tasks", user?.email],
        queryFn: async () => {
            try {
                if (!user?.email) {
                    console.error("No authenticated user");
                    return [];
                }

                console.log("Fetching analytics for user:", user.email);
                
                const result = await Task.filter({ 
                    created_by: user.email // CRITICAL: Filter by current user
                }, "-created_at");
                
                console.log(`Found ${result?.length || 0} tasks for analytics`);
                return result || [];
            } catch (error) {
                console.error("Error fetching tasks:", error);
                return [];
            }
        },
        enabled: !!user,
    });

    useEffect(() => {
        if (!userLoading && !user) {
            User.login();
        }
    }, [user, userLoading]);

    if (userLoading || tasksLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-banana-600" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    // Calculate stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task: any) => task.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate average completion time
    const completedWithDates = tasks.filter(
        (task: any) => task.completed && task.created_at && task.completedAt
    );
    const averageCompletionDays =
        completedWithDates.length > 0
            ? Math.round(
                  completedWithDates.reduce((acc: number, task: any) => {
                      return acc + differenceInDays(new Date(task.completedAt), new Date(task.created_at));
                  }, 0) / completedWithDates.length
              )
            : 0;

    // Completion trend data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, "MMM d");
        const completed = tasks.filter((task: any) => {
            if (!task.completedAt) return false;
            const completedDate = new Date(task.completedAt);
            return format(completedDate, "MMM d") === dateStr;
        }).length;
        return { date: dateStr, completed };
    });

    // Priority distribution
    const priorityData = [
        { name: "High", value: tasks.filter((task: any) => task.priority === "High").length },
        { name: "Medium", value: tasks.filter((task: any) => task.priority === "Medium").length },
        { name: "Low", value: tasks.filter((task: any) => task.priority === "Low").length },
    ].filter((item) => item.value > 0);

    // Status distribution
    const statusData = [
        { name: "To Do", count: tasks.filter((task: any) => task.status === "todo").length },
        { name: "In Progress", count: tasks.filter((task: any) => task.status === "in-progress").length },
        { name: "Completed", count: tasks.filter((task: any) => task.status === "completed").length },
    ].filter((item) => item.count > 0);

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center gap-4 px-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/dashboard")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Analytics Dashboard</h1>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Your Productivity Insights</h2>
                    <p className="text-muted-foreground">
                        Track your progress and optimize your workflow
                    </p>
                </div>

                <StatsCards
                    totalTasks={totalTasks}
                    completedTasks={completedTasks}
                    completionRate={completionRate}
                    averageCompletionDays={averageCompletionDays}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CompletionTrendChart data={last7Days} />
                    <PriorityDistributionChart data={priorityData} />
                </div>

                <StatusDistributionChart data={statusData} />

                {totalTasks === 0 && (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground mb-4">
                            No data to display yet. Create some tasks to see your analytics!
                        </p>
                        <Button
                            onClick={() => navigate("/dashboard")}
                            className="bg-banana-500 hover:bg-banana-600 text-black"
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}