import { useQuery } from "@tanstack/react-query";
import { Task, User, List, Tag } from "@/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, CheckSquare, Layers, Tag as TagIcon, TrendingUp } from "lucide-react";

const COLORS = ["#FFD93D", "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B"];

export default function SystemAnalytics() {
    const { data: users = [] } = useQuery({
        queryKey: ["allUsers"],
        queryFn: async () => {
            const result = await User.list();
            return result || [];
        },
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ["allTasks"],
        queryFn: async () => {
            const result = await Task.list();
            return result || [];
        },
    });

    const { data: lists = [] } = useQuery({
        queryKey: ["allLists"],
        queryFn: async () => {
            const result = await List.list();
            return result || [];
        },
    });

    const { data: tags = [] } = useQuery({
        queryKey: ["allTags"],
        queryFn: async () => {
            const result = await Tag.list();
            return result || [];
        },
    });

    // Calculate stats
    const totalUsers = users.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task: any) => task.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // User role distribution
    const roleData = [
        { name: "Users", value: users.filter((u: any) => u.role === "user" || !u.role).length },
        { name: "Premium", value: users.filter((u: any) => u.role === "premium").length },
        { name: "Admins", value: users.filter((u: any) => u.role === "admin").length },
    ].filter(item => item.value > 0);

    // Task priority distribution
    const priorityData = [
        { name: "High", value: tasks.filter((task: any) => task.priority === "High").length },
        { name: "Medium", value: tasks.filter((task: any) => task.priority === "Medium").length },
        { name: "Low", value: tasks.filter((task: any) => task.priority === "Low").length },
    ].filter(item => item.value > 0);

    // Task status distribution
    const statusData = [
        { name: "To Do", value: tasks.filter((task: any) => task.status === "todo").length },
        { name: "In Progress", value: tasks.filter((task: any) => task.status === "in-progress").length },
        { name: "Completed", value: tasks.filter((task: any) => task.status === "completed").length },
    ].filter(item => item.value > 0);

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{totalUsers}</div>
                                <div className="text-sm text-muted-foreground">Total Users</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                                <CheckSquare className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{totalTasks}</div>
                                <div className="text-sm text-muted-foreground">Total Tasks</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                                <Layers className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{lists.length}</div>
                                <div className="text-sm text-muted-foreground">Total Lists</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-banana-100 dark:bg-banana-900/30 p-3 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-banana-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{completionRate}%</div>
                                <div className="text-sm text-muted-foreground">Completion Rate</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>User Role Distribution</CardTitle>
                        <CardDescription>Breakdown of user roles across the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {roleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Task Status Overview</CardTitle>
                        <CardDescription>Current state of all tasks in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#FFD93D" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Priority Distribution</CardTitle>
                        <CardDescription>Task priorities across all users</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={priorityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Summary</CardTitle>
                        <CardDescription>Key metrics and statistics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Total Tags</span>
                            <span className="text-lg font-bold">{tags.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Completed Tasks</span>
                            <span className="text-lg font-bold">{completedTasks}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Active Tasks</span>
                            <span className="text-lg font-bold">{totalTasks - completedTasks}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Average Tasks per User</span>
                            <span className="text-lg font-bold">
                                {totalUsers > 0 ? (totalTasks / totalUsers).toFixed(1) : 0}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}