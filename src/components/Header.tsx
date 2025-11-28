import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";

export default function Header() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <img
                        src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/dbdbba43-10e8-476a-8d86-f732d63edeed/x3quk5sxm0hbi1h6kufdz/1764373049972-GoTodoBanana-logo-1024x1024-trsp.png"
                        alt="GoTodoBanana - notepad with banana and checkmark"
                        className="h-8 w-8"
                    />
                    <span className="text-lg font-bold bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
                        GoTodoBanana
                    </span>
                </Link>

                <nav className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                    
                    <Link to="/dashboard">
                        <Button className="bg-banana-500 hover:bg-banana-600 text-black">
                            Get Started
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    );
}