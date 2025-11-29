import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/entities";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Pricing() {
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

    const handleGetStarted = async () => {
        await User.login();
    };

    const plans = [
        {
            name: "Free Forever",
            price: "$0",
            period: "/forever",
            description: "Perfect for individuals getting started",
            features: [
                "Unlimited tasks and lists",
                "All view modes (List, Kanban, Calendar)",
                "Drag-and-drop functionality",
                "Smart priorities and tags",
                "Basic calendar integration",
                "100MB file storage",
                "Dark mode",
                "Mobile responsive",
                "Email support"
            ],
            cta: "Get Started Free",
            highlighted: true,
            popular: true
        },
        {
            name: "Premium",
            price: billingPeriod === "monthly" ? "$10" : "$96",
            period: billingPeriod === "monthly" ? "/month" : "/year",
            savings: billingPeriod === "yearly" ? "Save $24/year" : null,
            description: "For power users who need more",
            features: [
                "Everything in Free, plus:",
                "Unlimited automation flows",
                "Advanced analytics & reports",
                "Priority email support",
                "1GB+ file storage",
                "Custom integrations",
                "Export/import options",
                "Team collaboration (coming soon)",
                "Early access to new features"
            ],
            cta: "Upgrade to Premium",
            highlighted: false,
            popular: false
        }
    ];

    return (
        <section id="pricing" className="py-20 md:py-32 bg-muted/30">
            <div className="container">
                <div className="text-center mb-16 space-y-4">
                    <Badge className="bg-banana-100 text-banana-800 dark:bg-banana-900/30 dark:text-banana-300 border-banana-200 dark:border-banana-800">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Simple Pricing
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-bold">
                        Choose Your{" "}
                        <span className="bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
                            Perfect Plan
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Start free forever. Upgrade when you need advanced features. No credit card required.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-3 pt-4">
                        <span className={`text-sm ${billingPeriod === "monthly" ? "font-semibold" : "text-muted-foreground"}`}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setBillingPeriod(prev => prev === "monthly" ? "yearly" : "monthly")}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                billingPeriod === "yearly" ? "bg-banana-500" : "bg-gray-300 dark:bg-gray-600"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    billingPeriod === "yearly" ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                        <span className={`text-sm ${billingPeriod === "yearly" ? "font-semibold" : "text-muted-foreground"}`}>
                            Yearly
                        </span>
                        {billingPeriod === "yearly" && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
                                Save 20%
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <Card
                            key={index}
                            className={`p-8 space-y-6 transition-all duration-300 hover:shadow-2xl ${
                                plan.highlighted
                                    ? "border-2 border-banana-500 shadow-xl relative"
                                    : "hover:scale-105"
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-banana-500 text-black hover:bg-banana-600 px-4 py-1">
                                        ⭐ Most Popular
                                    </Badge>
                                </div>
                            )}

                            <div>
                                <h3 className="text-2xl font-bold">{plan.name}</h3>
                                <p className="text-muted-foreground mt-2">{plan.description}</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground text-lg">{plan.period}</span>
                                </div>
                                {plan.savings && (
                                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                        {plan.savings}
                                    </p>
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
                                onClick={handleGetStarted}
                                size="lg"
                            >
                                {plan.cta}
                            </Button>

                            {plan.highlighted && (
                                <p className="text-xs text-center text-muted-foreground">
                                    No credit card required • Cancel anytime
                                </p>
                            )}
                        </Card>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-muted-foreground text-sm">
                        All plans include our core features. Premium adds power user capabilities.
                    </p>
                </div>
            </div>
        </section>
    );
}