import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User } from "@/entities";
import { Check } from "lucide-react";

export default function Pricing() {
  const handleGetStarted = async () => {
    await User.login();
  };

  const plans = [
    {
      name: "Free Forever",
      price: "$0",
      description: "Perfect for personal use",
      features: [
        "Unlimited tasks and lists",
        "All view modes (List, Kanban, Calendar)",
        "Drag-and-drop functionality",
        "Smart priorities and tags",
        "Calendar integration",
        "Google Drive attachments",
        "Up to 5 automation flows",
        "100MB file storage",
        "Dark mode",
        "Mobile responsive"
      ],
      cta: "Get Started Free",
      highlighted: true
    },
    {
      name: "Premium",
      price: "$9",
      period: "/month",
      description: "For power users and teams",
      features: [
        "Everything in Free, plus:",
        "Unlimited automation flows",
        "Team collaboration features",
        "Advanced analytics & reports",
        "1GB+ file storage",
        "Priority support",
        "Custom integrations",
        "Export/import options",
        "White-label options",
        "Early access to new features"
      ],
      cta: "Coming Soon",
      highlighted: false
    }
  ];

  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">
            Simple,{" "}
            <span className="bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free forever. Upgrade when you need advanced features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 space-y-6 ${
                plan.highlighted
                  ? "border-2 border-banana-500 shadow-xl scale-105"
                  : ""
              }`}
            >
              {plan.highlighted && (
                <div className="bg-banana-500 text-black px-3 py-1 rounded-full text-sm font-medium w-fit">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-banana-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.highlighted
                    ? "bg-banana-500 hover:bg-banana-600 text-black"
                    : ""
                }`}
                onClick={plan.highlighted ? handleGetStarted : undefined}
                disabled={!plan.highlighted}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}