import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Task } from "@/entities";
import { useLists } from "@/hooks/use-lists";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar";
import TaskList from "@/components/dashboard/TaskList";
import TaskForm from "@/components/dashboard/TaskForm";
import TaskToolbar from "@/components/dashboard/TaskToolbar";
import CalendarView from "@/components/dashboard/CalendarView";
import KanbanView from "@/components/dashboard/KanbanView";
import TaskGroupView from "@/components/dashboard/TaskGroupView";
import DailyOverview from "@/components/dashboard/DailyOverview";
import FocusMode from "@/components/dashboard/FocusMode";
import TrashView from "@/components/dashboard/TrashView";
import WidgetsSidebar from "@/components/dashboard/WidgetsSidebar";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { Loader2, Keyboard, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Dashboard() {
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [isTrashSelected, setIsTrashSelected] = useState(false);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentView, setCurrentView] = useState<"list" | "calendar" | "kanban">("list");
    const [groupBy, setGroupBy] = useState<"none" | "list" | "priority" | "dueDate" | "status">("none");
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(() => {
        const saved = localStorage.getItem("leftSidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(() => {
        const saved = localStorage.getItem("rightSidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
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

    useEffect(() => {
        localStorage.setItem("leftSidebarOpen", JSON.stringify(isLeftSidebarOpen));
    }, [isLeftSidebarOpen]);

    useEffect(() => {
        localStorage.setItem("rightSidebarOpen", JSON.stringify(isRightSidebarOpen));
    }, [isRightSidebarOpen]);

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
                console.log("Fetching tasks...");
                let result;
                
                if (selectedListId) {
                    result = await Task.filter({ 
                        listId: selectedListId,
                        deleted: false 
                    }, filters.sortBy);
                } else {
                    result = await Task.filter({ deleted: false }, filters.sortBy);
                }

                console.log("Tasks fetched from database:", result);

                let filteredTasks = result || [];

                if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    filteredTasks = filteredTasks.filter((task: any) =>
                        task.title?.toLowerCase().includes(query) ||
                        task.description?.toLowerCase().includes(query) ||
                        task.tags?.some((tag: string) => tag.toLowerCase().includes(query))
                    );
                }

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

                if (filters.tags && filters.tags.length > 0) {
                    filteredTasks = filteredTasks.filter((task: any) => {
                        if (!task.tags || task.tags.length === 0) return false;
                        return filters.tags!.some(tag => task.tags.includes(tag));
                    });
                }

                if (filters.lists && filters.lists.length > 0) {
                    filteredTasks = filteredTasks.filter((task: any) => {
                        return filters.lists!.includes(task.listId);
                    });
                }

                console.log("Final filtered tasks:", filteredTasks.length, "tasks");
                return filteredTasks;
            } catch (error) {
                console.error("Error fetching tasks:", error);
                return [];
            }
        },
        enabled: !!user && !isTrashSelected,
    });

    const displayTasks = isFocusMode
        ? tasks.filter((task: any) => task.priority === "High" && !task.completed)
        : tasks;

    useEffect(() => {
        if (!userLoading && !user) {
            User.login();
        }
    }, [user, userLoading, navigate]);

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

    const handleSelectList = (listId: string | null) => {
        setSelectedListId(listId);
        setIsTrashSelected(false);
    };

    const handleSelectTrash = () => {
        setIsTrashSelected(true);
        setSelectedListId(null);
    };

    // Generate breadcrumb items based on current view
    const getBreadcrumbItems = () => {
        const items = [];
        
        if (isTrashSelected) {
            items.push({ label: "Trash" });
        } else if (selectedListId) {
            const selectedList = lists.find(l => l.id === selectedListId);
            if (selectedList) {
                items.push({ label: selectedList.name });
            }
        } else {
            items.push({ label: "All Tasks" });
        }

        if (currentView === "calendar") {
            items.push({ label: "Calendar View" });
        } else if (currentView === "kanban") {
            items.push({ label: "Kanban Board" });
        }

        return items;
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <DashboardHeader 
                onNewTask={handleNewTask} 
                onSearch={setSearchQuery}
                onNotificationTaskClick={handleNotificationTaskClick}
            />

            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Sidebar */}
                <div 
                    className={`border-r bg-muted/30 flex flex-col h-full transition-all duration-300 ease-in-out ${
                        isLeftSidebarOpen ? "w-64" : "w-0"
                    }`}
                    style={{ overflow: isLeftSidebarOpen ? "visible" : "hidden" }}
                >
                    {isLeftSidebarOpen && (
                        <Sidebar
                            selectedListId={selectedListId}
                            onSelectList={handleSelectList}
                            onSelectTrash={handleSelectTrash}
                            isTrashSelected={isTrashSelected}
                        />
                    )}
                </div>

                {/* Left Sidebar Toggle Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-r-md rounded-l-none border-r border-t border-b bg-background shadow-sm hover:bg-accent transition-all"
                            style={{ left: isLeftSidebarOpen ? "256px" : "0" }}
                            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                        >
                            {isLeftSidebarOpen ? (
                                <PanelLeftClose className="h-4 w-4" />
                            ) : (
                                <PanelLeftOpen className="h-4 w-4" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {isLeftSidebarOpen ? "Hide Lists" : "Show Lists"}
                    </TooltipContent>
                </Tooltip>

                <main className="flex-1 overflow-auto flex flex-col">
                    {isTrashSelected ? (
                        <div className="p-6 flex-1">
                            <Breadcrumb items={getBreadcrumbItems()} />
                            <TrashView />
                        </div>
                    ) : (
                        <div className="flex h-full flex-1">
                            <div className="flex-1 p-6 overflow-auto flex flex-col">
                                <Breadcrumb items={getBreadcrumbItems()} />
                                
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h1 className="text-3xl font-bold">
                                                {selectedListId 
                                                    ? lists.find(l => l.id === selectedListId)?.name || "List Tasks"
                                                    : "All Tasks"
                                                }
                                            </h1>
                                            <p className="text-muted-foreground mt-1">
                                                {displayTasks.length} {displayTasks.length === 1 ? 'task' : 'tasks'}
                                            </p>
                                        </div>
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
                                    </div>
                                </div>

                                {currentView === "list" && (
                                    <div className="mb-6">
                                        <FocusMode
                                            isActive={isFocusMode}
                                            onToggle={handleToggleFocusMode}
                                            filteredTasksCount={displayTasks.length}
                                            totalTasksCount={tasks.length}
                                        />
                                    </div>
                                )}

                                <TaskToolbar
                                    currentView={currentView}
                                    onViewChange={setCurrentView}
                                    onGroupByChange={currentView === "list" ? setGroupBy : undefined}
                                    onFilterChange={handleFilterChange}
                                    activeFilters={filters}
                                    tags={allTags}
                                    lists={lists}
                                />

                                {currentView === "list" && (
                                    <>
                                        <DailyOverview tasks={tasks} onTaskClick={handleEditTask} />
                                        
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

                                <div className="mt-auto pt-8">
                                    <Footer />
                                </div>
                            </div>

                            {/* Right Sidebar */}
                            {currentView === "list" && (
                                <div 
                                    className={`border-l bg-muted/30 p-4 overflow-auto transition-all duration-300 ease-in-out ${
                                        isRightSidebarOpen ? "w-80" : "w-0"
                                    }`}
                                    style={{ overflow: isRightSidebarOpen ? "auto" : "hidden" }}
                                >
                                    {isRightSidebarOpen && (
                                        <WidgetsSidebar
                                            totalTasks={tasks.length}
                                            completedTasks={completedTasks}
                                            overdueTasks={overdueTasks}
                                            todayTasks={todayTasks}
                                            tasks={tasks}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Right Sidebar Toggle Button */}
                            {currentView === "list" && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-l-md rounded-r-none border-l border-t border-b bg-background shadow-sm hover:bg-accent transition-all"
                                            style={{ right: isRightSidebarOpen ? "320px" : "0" }}
                                            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                                        >
                                            {isRightSidebarOpen ? (
                                                <PanelRightClose className="h-4 w-4" />
                                            ) : (
                                                <PanelRightOpen className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                        {isRightSidebarOpen ? "Hide Widgets" : "Show Widgets"}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    )}
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