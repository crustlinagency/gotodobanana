import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Task } from "@/entities";
import { useLists } from "@/hooks/use-lists";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar";
import StatsWidget from "@/components/dashboard/StatsWidget";
import FilterBar from "@/components/dashboard/FilterBar";
import TaskList from "@/components/dashboard/TaskList";
import TaskForm from "@/components/dashboard/TaskForm";
import ViewSwitcher from "@/components/dashboard/ViewSwitcher";
import CalendarView from "@/components/dashboard/CalendarView";
import KanbanView from "@/components/dashboard/KanbanView";
import TaskGroupView from "@/components/dashboard/TaskGroupView";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";
import DailyOverview from "@/components/dashboard/DailyOverview";
import WeeklyProductivity from "@/components/dashboard/WeeklyProductivity";
import FocusMode from "@/components/dashboard/FocusMode";
import { useNavigate } from "react-router-dom";
import { Loader2, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Dashboard() {
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentView, setCurrentView] = useState<"list" | "calendar" | "kanban">("list");
    const [groupBy, setGroupBy] = useState<"none" | "list" | "priority" | "dueDate" | "status">("none");
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [filters, setFilters] = useState({
        priority: "all",
        status: "all",
        sortBy: "-created_at",
        dateRange: undefined as string | undefined,
        dateFrom: undefined as string | undefined,
        dateTo: undefined as string | undefined,
        tags: undefined as string[] | undefined,
        lists: undefined as string[] | undefined,
    });

    const navigate = useNavigate();
    const { data: lists = [] } = useLists();

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

                // Search filter
                if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    filteredTasks = filteredTasks.filter((task: any) =>
                        task.title?.toLowerCase().includes(query) ||
                        task.description?.toLowerCase().includes(query) ||
                        task.tags?.some((tag: string) => tag.toLowerCase().includes(query))
                    );
                }

                // Priority filter
                if (filters.priority !== "all") {
                    filteredTasks = filteredTasks.filter(
                        (task: any) => task.priority === filters.priority
                    );
                }

                // Status filter
                if (filters.status !== "all") {
                    filteredTasks = filteredTasks.filter(
                        (task: any) => task.status === filters.status
                    );
                }

                // Date range filter
                if (filters.dateRange) {
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    
                    filteredTasks = filteredTasks.filter((task: any) => {
                        if (!task.dueDate) return false;
                        const dueDate = new Date(task.dueDate);
                        
                        switch (filters.dateRange) {
                            case "today":
                                return dueDate.toDateString() === today.toDateString();
                            case "week":
                                const weekFromNow = new Date(today);
                                weekFromNow.setDate(weekFromNow.getDate() + 7);
                                return dueDate >= today && dueDate <= weekFromNow;
                            case "month":
                                const monthFromNow = new Date(today);
                                monthFromNow.setMonth(monthFromNow.getMonth() + 1);
                                return dueDate >= today && dueDate <= monthFromNow;
                            case "overdue":
                                return dueDate < today && !task.completed;
                            case "custom":
                                if (filters.dateFrom && filters.dateTo) {
                                    const from = new Date(filters.dateFrom);
                                    const to = new Date(filters.dateTo);
                                    return dueDate >= from && dueDate <= to;
                                }
                                return true;
                            default:
                                return true;
                        }
                    });
                }

                // Tags filter
                if (filters.tags && filters.tags.length > 0) {
                    filteredTasks = filteredTasks.filter((task: any) => {
                        if (!task.tags || task.tags.length === 0) return false;
                        return filters.tags!.some(tag => task.tags.includes(tag));
                    });
                }

                // Lists filter
                if (filters.lists && filters.lists.length > 0) {
                    filteredTasks = filteredTasks.filter((task: any) => {
                        return filters.lists!.includes(task.listId);
                    });
                }

                return filteredTasks;
            } catch (error) {
                console.error("Error fetching tasks:", error);
                return [];
            }
        },
        enabled: !!user,
    });

    // Focus mode: filter to high priority and not completed
    const displayTasks = isFocusMode
        ? tasks.filter((task: any) => task.priority === "High" && !task.completed)
        : tasks;

    useEffect(() => {
        if (!userLoading && !user) {
            User.login();
        }
    }, [user, userLoading, navigate]);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onNewTask: () => {
            handleNewTask();
            toast.success("New task dialog opened (Ctrl+N)");
        },
        onSearch: () => {
            const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
            if (searchInput) {
                searchInput.focus();
                toast.success("Search activated (Ctrl+K)");
            }
        },
        onToggleFocus: () => {
            setIsFocusMode(prev => !prev);
            toast.success(isFocusMode ? "Focus Mode disabled (Ctrl+F)" : "Focus Mode enabled (Ctrl+F)");
        },
    });

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

    // Extract all unique tags from tasks
    const allTags = tasks.reduce((tags: string[], task: any) => {
        if (task.tags && Array.isArray(task.tags)) {
            return [...tags, ...task.tags];
        }
        return tags;
    }, []);

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

    const handleNotificationTaskClick = (task: any) => {
        handleEditTask(task);
    };

    const handleToggleFocusMode = () => {
        setIsFocusMode(prev => !prev);
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <DashboardHeader 
                onNewTask={handleNewTask} 
                onSearch={setSearchQuery}
                onNotificationTaskClick={handleNotificationTaskClick}
            />

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
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="icon">
                                                <Keyboard className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <div className="space-y-2">
                                                <p className="font-semibold">Keyboard Shortcuts</p>
                                                <div className="space-y-1 text-xs">
                                                    <div>Ctrl+N - Create task</div>
                                                    <div>Ctrl+K - Search</div>
                                                    <div>Ctrl+F - Focus Mode</div>
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                    <ViewSwitcher
                                        currentView={currentView}
                                        onViewChange={setCurrentView}
                                    />
                                </div>
                            </div>
                            <p className="text-muted-foreground">
                                Organize, prioritize, and accomplish your goals
                            </p>
                        </div>

                        {/* Focus Mode Toggle */}
                        <div className="mb-6">
                            <FocusMode
                                isActive={isFocusMode}
                                onToggle={handleToggleFocusMode}
                                filteredTasksCount={displayTasks.length}
                            />
                        </div>

                        {/* Productivity Widgets */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <div className="lg:col-span-2 space-y-6">
                                <StatsWidget
                                    totalTasks={tasks.length}
                                    completedTasks={completedTasks}
                                    overdueTasks={overdueTasks}
                                    todayTasks={todayTasks}
                                />
                                <DailyOverview tasks={tasks} onTaskClick={handleEditTask} />
                            </div>
                            <div className="space-y-6">
                                <WeeklyProductivity tasks={tasks} />
                                <RecentActivityFeed tasks={tasks} />
                            </div>
                        </div>

                        {currentView === "list" && (
                            <>
                                <FilterBar 
                                    onFilterChange={handleFilterChange}
                                    onGroupByChange={setGroupBy}
                                    activeFilters={filters}
                                    tags={allTags}
                                    lists={lists}
                                />
                                {tasksLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="h-8 w-8 animate-spin text-banana-600" />
                                    </div>
                                ) : groupBy !== "none" ? (
                                    <TaskGroupView
                                        tasks={displayTasks}
                                        groupBy={groupBy}
                                        onEditTask={handleEditTask}
                                        lists={lists}
                                    />
                                ) : (
                                    <TaskList tasks={displayTasks} onEditTask={handleEditTask} />
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
                                        tasks={displayTasks}
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
                                        tasks={displayTasks}
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