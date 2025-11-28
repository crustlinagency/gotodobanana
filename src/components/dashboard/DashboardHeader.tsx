import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
    onNewTask: () => void;
    onSearch: (query: string) => void;
}

export default function DashboardHeader({ onNewTask, onSearch }: DashboardHeaderProps) {
    const [isDark, setIsDark] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: async () => await User.me(),
    });

    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains("dark");
        setIsDark(isDarkMode);
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDark;
        setIsDark(newMode);
        if (newMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

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
                        src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/files/chat-generated-images/project-x3quk5sxm0hbi1h6kufdz/a59ed40e-46b9-49c6-ba5b-9c1d232290de.png"
                        alt="GoTodoBanana logo"
                        className="h-8 w-8"
                    />
                    <span className="hidden md:block text-lg font-bold bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
                        GoTodoBanana
                    </span>
                </Link>

                {/* Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
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

                    <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
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