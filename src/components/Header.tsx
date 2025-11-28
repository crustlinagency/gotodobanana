import { Button } from "@/components/ui/button";
import { User } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";

export default function Header() {
    const { isDark, toggleTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            try {
                return await User.me();
            } catch {
                return null;
            }
        }
    });

    const handleLogin = async () => {
        await User.login();
    };

    const handleLogout = async () => {
        await User.logout();
        window.location.href = "/";
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <img
                        src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/files/chat-generated-images/project-x3quk5sxm0hbi1h6kufdz/79262c9a-96af-41bf-977d-38e233cda655.png"
                        alt="GoTodoBanana logo - banana icon"
                        className="h-10 w-10"
                    />
                    <span className="text-xl font-bold bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
                        GoTodoBanana
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {user ? (
                        <>
                            <Link to="/dashboard">
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={toggleTheme}>
                                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">
                                    {user.full_name || user.email}
                                </span>
                                <Button onClick={handleLogout} variant="outline">
                                    Logout
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="icon" onClick={toggleTheme}>
                                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>
                            <Button onClick={handleLogin} variant="default" className="bg-banana-500 hover:bg-banana-600 text-black">
                                Get Started
                            </Button>
                        </>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-background p-4">
                    <nav className="flex flex-col gap-4">
                        {user ? (
                            <>
                                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button variant="ghost" className="justify-start" onClick={toggleTheme}>
                                    {isDark ? (
                                        <>
                                            <Sun className="h-5 w-5 mr-2" /> Light Mode
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="h-5 w-5 mr-2" /> Dark Mode
                                        </>
                                    )}
                                </Button>
                                <div className="text-sm text-muted-foreground px-2">
                                    {user.full_name || user.email}
                                </div>
                                <Button onClick={handleLogout} variant="outline" className="w-full">
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" className="justify-start" onClick={toggleTheme}>
                                    {isDark ? (
                                        <>
                                            <Sun className="h-5 w-5 mr-2" /> Light Mode
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="h-5 w-5 mr-2" /> Dark Mode
                                        </>
                                    )}
                                </Button>
                                <Button onClick={handleLogin} className="w-full bg-banana-500 hover:bg-banana-600 text-black">
                                    Get Started
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}