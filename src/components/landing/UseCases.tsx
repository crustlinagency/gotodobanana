import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, GraduationCap, Home, Rocket, Users, Laptop } from "lucide-react";

export default function UseCases() {
    const useCases = [
        {
            icon: <Briefcase className="h-8 w-8 text-banana-600" />,
            title: "Project Managers",
            description: "Coordinate team projects with Kanban boards, track deadlines with calendar views, and prioritize tasks across multiple initiatives.",
            features: ["Multiple list views", "Priority tracking", "Deadline management"]
        },
        {
            icon: <Laptop className="h-8 w-8 text-banana-600" />,
            title: "Freelancers & Consultants",
            description: "Juggle multiple clients, track billable hours, and never miss a deadline. Organize projects by client with custom lists and tags.",
            features: ["Client organization", "Task priorities", "Quick filters"]
        },
        {
            icon: <GraduationCap className="h-8 w-8 text-banana-600" />,
            title: "Students",
            description: "Stay on top of assignments, exams, and projects. Use the calendar view to plan study sessions and track important academic deadlines.",
            features: ["Assignment tracking", "Exam planning", "Study schedules"]
        },
        {
            icon: <Rocket className="h-8 w-8 text-banana-600" />,
            title: "Startup Teams",
            description: "Move fast with drag-and-drop task management. Track product launches, feature development, and growth initiatives all in one place.",
            features: ["Sprint planning", "Feature tracking", "Team coordination"]
        },
        {
            icon: <Home className="h-8 w-8 text-banana-600" />,
            title: "Home & Personal",
            description: "Manage household chores, shopping lists, meal planning, and personal goals. Keep your life organized with simple, visual task management.",
            features: ["Daily routines", "Shopping lists", "Goal tracking"]
        },
        {
            icon: <Users className="h-8 w-8 text-banana-600" />,
            title: "Content Creators",
            description: "Plan content calendars, track publishing schedules, and manage creative projects. Organize ideas, drafts, and deadlines visually.",
            features: ["Content calendar", "Publishing schedule", "Idea management"]
        }
    ];

    return (
        <section className="py-20 md:py-32">
            <div className="container">
                <div className="text-center mb-16 space-y-4">
                    <Badge className="bg-banana-100 text-banana-800 dark:bg-banana-900/30 dark:text-banana-300 border-banana-200 dark:border-banana-800">
                        Real-World Applications
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-bold">
                        Perfect For{" "}
                        <span className="bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
                            Every Workflow
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Whether you're managing projects, studying, freelancing, or organizing your personal life - 
                        GoTodoBanana adapts to your needs.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {useCases.map((useCase, index) => (
                        <Card
                            key={index}
                            className="p-6 space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="bg-banana-100 dark:bg-banana-900/30 w-16 h-16 rounded-lg flex items-center justify-center">
                                {useCase.icon}
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {useCase.description}
                                </p>
                            </div>

                            <div className="pt-2 border-t">
                                <div className="flex flex-wrap gap-2">
                                    {useCase.features.map((feature, i) => (
                                        <Badge
                                            key={i}
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {feature}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}