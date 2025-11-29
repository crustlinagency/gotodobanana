import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/entities";
import { CheckCircle2, Calendar, Tags, Zap, Play } from "lucide-react";

export default function Hero() {
    const handleGetStarted = async () => {
        await User.login();
    };

    return (
        <section className="relative overflow-hidden py-20 md:py-32">
            <div className="absolute inset-0 bg-gradient-to-br from-banana-50 via-background to-grape-50 dark:from-banana-950/20 dark:via-background dark:to-grape-950/20" />
            
            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-banana-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-grape-500/10 rounded-full blur-3xl" />
            
            <div className="container relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <div className="space-y-6 animate-slide-up">
                        <Badge className="bg-banana-100 text-banana-800 dark:bg-banana-900/30 dark:text-banana-300 border-banana-200 dark:border-banana-800 w-fit">
                            ✨ Free Forever Plan Available
                        </Badge>
                        
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
                            Organize Your Life,{" "}
                            <span className="bg-gradient-to-r from-banana-600 to-grape-600 dark:from-banana-400 dark:to-grape-400 bg-clip-text text-transparent">
                                Visually
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-100">
                            The powerful yet simple TODO app that makes task management actually enjoyable. 
                            Beautiful design meets advanced features like Kanban boards, calendar views, and smart priorities.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={handleGetStarted}
                                size="lg"
                                className="bg-banana-500 hover:bg-banana-600 text-black font-semibold"
                            >
                                Get Started Free
                            </Button>
                            <Button variant="outline" size="lg" className="group dark:border-gray-600 dark:text-white dark:hover:bg-white/10">
                                <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                                Watch Demo
                            </Button>
                        </div>

                        {/* Quick Features */}
                        <div className="grid grid-cols-2 gap-4 pt-6">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-banana-100 dark:bg-banana-900/30 flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4 text-banana-600 dark:text-banana-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Drag & Drop</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-banana-100 dark:bg-banana-900/30 flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-banana-600 dark:text-banana-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Calendar Sync</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-banana-100 dark:bg-banana-900/30 flex items-center justify-center">
                                    <Tags className="h-4 w-4 text-banana-600 dark:text-banana-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Smart Tags</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-banana-100 dark:bg-banana-900/30 flex items-center justify-center">
                                    <Zap className="h-4 w-4 text-banana-600 dark:text-banana-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Focus Mode</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="relative animate-fade-in">
                        <div className="absolute inset-0 bg-gradient-to-tr from-banana-500/20 to-grape-500/20 blur-3xl rounded-full" />
                        <img
                            src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/files/chat-generated-images/project-x3quk5sxm0hbi1h6kufdz/5e967855-adeb-4bef-9c2f-b850764138bb.png"
                            alt="GoTodoBanana task management dashboard showing Kanban board with colorful task cards"
                            className="relative rounded-2xl shadow-2xl border border-border"
                        />
                        
                        {/* Floating Stats Card */}
                        <div className="absolute -bottom-6 -left-6 bg-background rounded-lg shadow-xl border p-4 animate-slide-up hidden md:block">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-banana-500 to-grape-500 flex items-center justify-center text-white font-bold">
                                    ✓
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">247</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Tasks completed this week</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}