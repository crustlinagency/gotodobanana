import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export default function Testimonials() {
    const testimonials = [
        {
            name: "Sarah Chen",
            role: "Product Manager",
            company: "TechStart Inc",
            avatar: "SC",
            image: null,
            rating: 5,
            text: "GoTodoBanana transformed how I manage projects. The visual Kanban board makes it so easy to see everything at a glance. I've tried Asana and Todoist, but this is the perfect balance of simplicity and power."
        },
        {
            name: "Marcus Rodriguez",
            role: "Freelance Designer",
            company: null,
            avatar: "MR",
            image: null,
            rating: 5,
            text: "The drag-and-drop interface is incredibly intuitive. I love how I can switch between list and calendar views depending on my mood. The dark mode is gorgeous too!"
        },
        {
            name: "Emily Thompson",
            role: "Marketing Director",
            company: "GrowthCo",
            avatar: "ET",
            image: null,
            rating: 5,
            text: "Finally, a TODO app that doesn't overwhelm me with features I don't need. The priority system and smart filters help me focus on what matters most. Highly recommended!"
        },
        {
            name: "David Park",
            role: "Software Engineer",
            company: "DevTeam Ltd",
            avatar: "DP",
            image: null,
            rating: 5,
            text: "As a developer, I appreciate the keyboard shortcuts and clean interface. It's fast, responsive, and actually helps me get more done. The free plan is incredibly generous!"
        },
        {
            name: "Jennifer Mills",
            role: "Content Creator",
            company: null,
            avatar: "JM",
            image: null,
            rating: 5,
            text: "I've been using GoTodoBanana for 3 months now and my productivity has skyrocketed. The daily overview feature keeps me on track, and the visual design makes planning my day actually enjoyable."
        },
        {
            name: "Alex Kumar",
            role: "Startup Founder",
            company: "InnovateLabs",
            avatar: "AK",
            image: null,
            rating: 5,
            text: "This app strikes the perfect balance between being powerful enough for complex projects but simple enough to use daily. The banana theme adds a fun touch that makes task management less boring!"
        }
    ];

    return (
        <section className="py-20 md:py-32">
            <div className="container">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold">
                        Loved by{" "}
                        <span className="bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
                            Thousands of Users
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        See what our community has to say about their productivity transformation.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <Card
                            key={index}
                            className="p-6 space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Rating */}
                            <div className="flex gap-1">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-banana-500 text-banana-500" />
                                ))}
                            </div>

                            {/* Testimonial Text */}
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                "{testimonial.text}"
                            </p>

                            {/* Author Info */}
                            <div className="flex items-center gap-3 pt-2 border-t">
                                <Avatar className="h-10 w-10">
                                    {testimonial.image && (
                                        <AvatarImage src={testimonial.image} alt={testimonial.name} />
                                    )}
                                    <AvatarFallback className="bg-banana-100 text-banana-800 dark:bg-banana-900/30 dark:text-banana-300">
                                        {testimonial.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold text-sm">{testimonial.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {testimonial.role}
                                        {testimonial.company && ` • ${testimonial.company}`}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}