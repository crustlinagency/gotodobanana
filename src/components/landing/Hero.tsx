import { Button } from "@/components/ui/button";
import { User } from "@/entities";
import { CheckCircle2, Calendar, Tags, Zap } from "lucide-react";

export default function Hero() {
  const handleGetStarted = async () => {
    await User.login();
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-banana-50 via-background to-grape-50 dark:from-banana-950/20 dark:via-background dark:to-grape-950/20" />
      
      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 animate-slide-up">
            <div className="inline-block">
              <span className="bg-banana-100 dark:bg-banana-900/30 text-banana-800 dark:text-banana-300 px-4 py-2 rounded-full text-sm font-medium">
                ✨ Free Forever Plan Available
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Organize Your Life,{" "}
              <span className="bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
                Visually
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground">
              The advanced TODO app that combines beautiful design with powerful features. 
              Drag, drop, and organize your tasks the way your brain works.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-banana-500 hover:bg-banana-600 text-black font-semibold"
              >
                Get Started Free
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>

            {/* Quick Features */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-banana-600" />
                <span className="text-sm">Drag & Drop</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-banana-600" />
                <span className="text-sm">Calendar Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <Tags className="h-5 w-5 text-banana-600" />
                <span className="text-sm">Smart Tags</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-banana-600" />
                <span className="text-sm">AI Powered</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-tr from-banana-500/20 to-grape-500/20 blur-3xl rounded-full" />
            <img
              src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/files/chat-generated-images/project-x3quk5sxm0hbi1h6kufdz/5e967855-adeb-4bef-9c2f-b850764138bb.png"
              alt="Task management visualization"
              className="relative rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}