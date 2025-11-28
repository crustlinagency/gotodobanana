import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/dbdbba43-10e8-476a-8d86-f732d63edeed/x3quk5sxm0hbi1h6kufdz/1764373049972-GoTodoBanana-logo-1024x1024-trsp.png"
                            alt="GoTodoBanana - notepad with banana and checkmark"
                            className="h-8 w-8"
                        />
                        <span className="text-xl font-bold bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
                            GoTodoBanana
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="#features" className="text-sm font-medium hover:text-primary transition-colors">
                            Features
                        </Link>
                        <Link to="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                            Pricing
                        </Link>
                        <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                            Dashboard
                        </Link>
                        <Link to="/analytics" className="text-sm font-medium hover:text-primary transition-colors">
                            Analytics
                        </Link>
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/dashboard">
                            <Button className="bg-banana-500 hover:bg-banana-600 text-black font-semibold">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <nav className="flex flex-col gap-4">
                            <Link
                                to="#features"
                                className="text-sm font-medium hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </Link>
                            <Link
                                to="#pricing"
                                className="text-sm font-medium hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Pricing
                            </Link>
                            <Link
                                to="/dashboard"
                                className="text-sm font-medium hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/analytics"
                                className="text-sm font-medium hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Analytics
                            </Link>
                            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full bg-banana-500 hover:bg-banana-600 text-black font-semibold">
                                    Get Started
                                </Button>
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}