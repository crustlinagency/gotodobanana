import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function FAQ() {
    const faqs = [
        {
            question: "Is GoTodoBanana really free?",
            answer: "Yes! Our Free Forever plan includes unlimited tasks and lists, all view modes (List, Kanban, Calendar), drag-and-drop functionality, smart priorities, tags, and more. You'll never hit a task limit or be forced to upgrade."
        },
        {
            question: "What's the difference between Free and Premium?",
            answer: "The Free plan includes all core features you need for personal productivity. Premium adds unlimited automation flows, advanced analytics, priority support, increased storage (1GB+), and early access to new features. Perfect for power users and teams."
        },
        {
            question: "Can I use GoTodoBanana on mobile?",
            answer: "Absolutely! GoTodoBanana is fully responsive and works beautifully on phones, tablets, and desktops. Access your tasks anywhere, anytime through your web browser."
        },
        {
            question: "How does the Kanban board work?",
            answer: "Our Kanban view lets you organize tasks into columns (To Do, In Progress, Done) and drag-and-drop them between stages. It's perfect for visualizing your workflow and tracking progress at a glance."
        },
        {
            question: "Can I organize tasks by projects or categories?",
            answer: "Yes! Use Lists to organize tasks by project, and Tags to categorize them. You can filter by list, tag, priority, status, or date range to find exactly what you need."
        },
        {
            question: "Does it integrate with my calendar?",
            answer: "GoTodoBanana includes a built-in calendar view that displays all your tasks with due dates. You can quickly see what's coming up and plan your schedule visually."
        },
        {
            question: "Can I collaborate with my team?",
            answer: "Team collaboration features are coming soon! For now, GoTodoBanana is optimized for individual productivity. We're working on team features and will announce them when ready."
        },
        {
            question: "What if I want to cancel Premium?",
            answer: "You can cancel anytime, no questions asked. Your account will revert to the Free Forever plan, and you'll keep all your tasks and data. No hard feelings!"
        },
        {
            question: "Is my data secure?",
            answer: "Yes! All your data is encrypted and securely stored. We take privacy seriously and will never sell your information to third parties."
        }
    ];

    return (
        <section className="py-20 md:py-32 bg-muted/30">
            <div className="container">
                <div className="text-center mb-16 space-y-4">
                    <Badge className="bg-banana-100 text-banana-800 dark:bg-banana-900/30 dark:text-banana-300 border-banana-200 dark:border-banana-800">
                        Got Questions?
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-bold">
                        Frequently Asked{" "}
                        <span className="bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
                            Questions
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to know about GoTodoBanana.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="bg-background border rounded-lg px-6"
                            >
                                <AccordionTrigger className="text-left hover:no-underline">
                                    <span className="font-semibold">{faq.question}</span>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}