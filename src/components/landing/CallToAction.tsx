import { Button } from "@/components/ui/button";
import { User } from "@/entities";
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
    const handleGetStarted = async () => {
        await User.login();
    };

    return (
        <section className="py-20 md:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-banana-100 via-grape-100 to-banana-100 dark:from-banana-950/20 dark:via-grape-950/20 dark:to-banana-950/20" />
            
            <div className="container relative z-10">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                        Ready to{" "}
                        <span className="bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
                            Transform
                        </span>{" "}
                        Your Productivity?
                    </h2>

                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Start organizing your tasks visually today. No credit card required. 
                        Free forever plan available.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button
                            onClick={handleGetStarted}
                            size="lg"
                            className="bg-banana-500 hover:bg-banana-600 text-black font-semibold text-lg px-8"
                        >
                            Get Started Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="text-lg px-8"
                        >
                            View Pricing
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span>Free forever plan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}