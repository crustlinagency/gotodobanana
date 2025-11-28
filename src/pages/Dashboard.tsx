import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Task } from "@/entities";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar";
import StatsWidget from "@/components/dashboard/StatsWidget";
import FilterBar from "@/components/dashboard/FilterBar";
import TaskList from "@/components/dashboard/TaskList";
import TaskForm from "@/components/dashboard/TaskForm";
import ViewSwitcher from "@/components/dashboard/ViewSwitcher";
import CalendarView from "@/components/dashboard/CalendarView";
import KanbanView from "@/components/dashboard/KanbanView";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentView, setCurrentView] = useState<"list" | "calendar" | "kanban">("list");
    const [filters, setFilters] = useState({
        priority: "all",
        status: "all",
        sortBy: "-created_at",
    });

    const navigate = useNavigate();

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            try {
                return await User.me();
            } catch (error) {
                console.error("Auth error:", error);
                return null;
            }
        },
    });

    const { data: tasks = [], isLoading: tasksLoading } = useQuery({
        queryKey: ["tasks", selectedListId, searchQuery, filters],
        queryFn: async () => {
            try {
                let result;
                
                if (selectedListId) {
                    result = await Task.filter({ listId: selectedListId }, filters.sortBy);
                } else {
                    result = await Task.list(filters.sortBy);
                }

                let filteredTasks = result || [];

                // Apply search
                if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    filteredTasks = filteredTasks.filter((task: any) =>
                        task.title?.toLowerCase().includes(query) ||
                        task.description?.toLowerCase().includes(query) ||
                        task.tags?.some((tag: string) => tag.toLowerCase().includes(query))
                    );
                }

                // Apply filters
                if (filters.priority !== "all") {
                    filteredTasks = filteredTasks.filter(
                        (task: any) => task.priority === filters.priority
                    );
                }

                if (filters.status !== "all") {
                    filteredTasks = filteredTasks.filter(
                        (task: any) => task.status === filters.status
                    );
                }

                return filteredTasks;
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
    }, [user, userLoading, navigate]);

    if (userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-banana-600" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const completedTasks = tasks.filter((task: any) => task.completed).length;
    const todayTasks = tasks.filter((task: any) => {
        if (!task.dueDate) return false;
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        return (
            dueDate.getDate() === today.getDate() &&
            dueDate.getMonth() === today.getMonth() &&
            dueDate.getFullYear() === today.getFullYear()
        );
    }).length;

    const overdueTasks = tasks.filter((task: any) => {
        if (!task.dueDate || task.completed) return false;
        return new Date(task.dueDate) < new Date();
    }).length;

    const handleNewTask = () => {
        setEditingTask(null);
        setIsTaskFormOpen(true);
    };

    const handleEditTask = (task: any) => {
        setEditingTask(task);
        setIsTaskFormOpen(true);
    };

    const handleFilterChange = (newFilters: any) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <DashboardHeader onNewTask={handleNewTask} onSearch={setSearchQuery} />

            <div className="flex-1 flex overflow-hidden">
                <Sidebar
                    selectedListId={selectedListId}
                    onSelectList={setSelectedListId}
                />

                <main className="flex-1 overflow-auto">
                    <div className="p-6">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-3xl font-bold">
                                    {selectedListId ? "List Tasks" : "All Tasks"}
                                </h1>
                                <ViewSwitcher
                                    currentView={currentView}
                                    onViewChange={setCurrentView}
                                />
                            </div>
                            <p className="text-muted-foreground">
                                Organize, prioritize, and accomplish your goals
                            </p>
                        </div>

                        <StatsWidget
                            totalTasks={tasks.length}
                            completedTasks={completedTasks}
                            overdueTasks={overdueTasks}
                            todayTasks={todayTasks}
                        />

                        {currentView === "list" && (
                            <>
                                <FilterBar onFilterChange={handleFilterChange} />
                                {tasksLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="h-8 w-8 animate-spin text-banana-600" />
                                    </div>
                                ) : (
                                    <TaskList tasks={tasks} onEditTask={handleEditTask} />
                                )}
                            </>
                        )}

                        {currentView === "calendar" && (
                            <>
                                {tasksLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="h-8 w-8 animate-spin text-banana-600" />
                                    </div>
                                ) : (
                                    <CalendarView
                                        tasks={tasks}
                                        onEditTask={handleEditTask}
                                        onNewTask={handleNewTask}
                                    />
                                )}
                            </>
                        )}

                        {currentView === "kanban" && (
                            <>
                                {tasksLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="h-8 w-8 animate-spin text-banana-600" />
                                    </div>
                                ) : (
                                    <KanbanView
                                        tasks={tasks}
                                        onEditTask={handleEditTask}
                                        onNewTask={handleNewTask}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>

            <TaskForm
                open={isTaskFormOpen}
                onClose={() => {
                    setIsTaskFormOpen(false);
                    setEditingTask(null);
                }}
                task={editingTask}
                defaultListId={selectedListId || undefined}
            />
        </div>
    );
}