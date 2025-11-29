import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import UseCases from "@/components/landing/UseCases";
import FAQ from "@/components/landing/FAQ";
import CallToAction from "@/components/landing/CallToAction";

export default function Index() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <Hero />
                <Features />
                <UseCases />
                <Pricing />
                <FAQ />
                <CallToAction />
            </main>
            <Footer />
        </div>
    );
}