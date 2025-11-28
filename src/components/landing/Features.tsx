import { Card } from "@/components/ui/card";
import { LayoutDashboard, Target, Filter, BarChart3, Repeat, Palette } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <LayoutDashboard className="h-8 w-8 text-banana-600" />,
      title: "Multiple Views",
      description: "Switch between List, Kanban, Calendar, and Timeline views to visualize your work your way."
    },
    {
      icon: <Target className="h-8 w-8 text-banana-600" />,
      title: "Smart Priorities",
      description: "Color-coded priorities (High, Medium, Low) help you focus on what matters most."
    },
    {
      icon: <Filter className="h-8 w-8 text-banana-600" />,
      title: "Advanced Filtering",
      description: "Find exactly what you need with powerful filters by date, priority, tags, and status."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-banana-600" />,
      title: "Productivity Insights",
      description: "Track your progress with daily and weekly completion stats and productivity charts."
    },
    {
      icon: <Repeat className="h-8 w-8 text-banana-600" />,
      title: "Recurring Tasks",
      description: "Set up tasks that repeat daily, weekly, or monthly so you never forget important habits."
    },
    {
      icon: <Palette className="h-8 w-8 text-banana-600" />,
      title: "Custom Tags & Lists",
      description: "Organize with unlimited color-coded tags and project lists that match your workflow."
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
              Get Things Done
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you organize, prioritize, and accomplish your goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 space-y-4 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="bg-banana-100 dark:bg-banana-900/30 w-16 h-16 rounded-lg flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Visual Feature Image */}
        <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl">
          <img
            src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/files/chat-generated-images/project-x3quk5sxm0hbi1h6kufdz/bee6bffe-bce5-4dd9-9dd4-d46580b619e9.png"
            alt="People using GoToDoBanana"
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}