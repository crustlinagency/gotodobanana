import { Link } from "react-router-dom";

export default function Footer() {
    const legalLinks = [
        { name: "Privacy Policy", url: "https://termify.io/privacy-policy/GULRQ0bChH" },
        { name: "Terms of Service", url: "https://termify.io/terms-and-conditions/PreWQOgHNj" },
        { name: "Cookie Policy", url: "https://termify.io/cookie-policy/Zr3WTyfv5u" },
        { name: "Refund Policy", url: "https://termify.io/return-and-refund/ydQz87mXFT" },
        { name: "Disclaimer", url: "https://termify.io/disclaimer/1GbEtlasek" },
    ];

    return (
        <footer className="border-t bg-background mt-auto">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="flex flex-col gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/dbdbba43-10e8-476a-8d86-f732d63edeed/x3quk5sxm0hbi1h6kufdz/1764373049972-GoTodoBanana-logo-1024x1024-trsp.png"
                                alt="GoTodoBanana - notepad with banana and checkmark"
                                className="h-8 w-8"
                            />
                            <span className="text-lg font-bold bg-gradient-to-r from-banana-600 to-grape-600 bg-clip-text text-transparent">
                                GoTodoBanana
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            The visual TODO app that helps you organize, prioritize, and accomplish more every day.
                        </p>
                    </div>

                    {/* Legal Links */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold">Legal</h3>
                        <ul className="flex flex-col gap-2">
                            {legalLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Get Started */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold">Get Started</h3>
                        <p className="text-sm text-muted-foreground">
                            Ready to boost your productivity? Create your free account today!
                        </p>
                        <Link 
                            to="/dashboard"
                            className="inline-flex items-center justify-center rounded-md bg-banana-500 hover:bg-banana-600 text-black px-4 py-2 text-sm font-medium transition-colors w-fit"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} GoTodoBanana. All rights reserved.
                </div>
            </div>
        </footer>
    );
}