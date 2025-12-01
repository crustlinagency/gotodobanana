import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Moon, Sun, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { useTheme } from "@/hooks/use-theme";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardHeaderProps {
    onNewTask: () => void;
    onSearch: (query: string) => void;
    onNotificationTaskClick?: (task: any) => void;
}

export default function DashboardHeader({ onNewTask, onSearch, onNotificationTaskClick }: DashboardHeaderProps) {
    const { isDark, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: async () => await User.me(),
    });

    const handleLogout = async () => {
        await User.logout();
        window.location.href = "/";
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch(query);
    };

    return (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 mr-4">
                    <img
                        src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/dbdbba43-10e8-476a-8d86-f732d63edeed/x3quk5sxm0hbi1h6kufdz/1764373049972-GoTodoBanana-logo-1024x1024-trsp.png"
                        alt="GoTodoBanana - notepad with banana and checkmark"
                        className="h-8 w-8"
                    />
                    <span className="hidden md:block text-lg font-bold bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
                        GoTodoBanana
                    </span>
                    <Badge 
                        variant="outline" 
                        className="text-xs px-1.5 py-0 h-5 bg-banana-100 dark:bg-banana-900/30 text-banana-700 dark:text-banana-400 border-banana-300 dark:border-banana-700"
                    >
                        BETA
                    </Badge>
                </Link>

                {/* Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search tasks..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        onClick={onNewTask}
                        className="bg-banana-500 hover:bg-banana-600 text-black"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">New Task</span>
                    </Button>

                    <NotificationBell 
                        onTaskClick={onNotificationTaskClick || (() => {})} 
                    />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => navigate("/settings")}
                            >
                                <Settings className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Settings
                        </TooltipContent>
                    </Tooltip>

                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>

                    <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l">
                        <span className="text-sm text-muted-foreground">
                            {user?.full_name || user?.email}
                        </span>
                        <Button onClick={handleLogout} variant="outline" size="sm">
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}