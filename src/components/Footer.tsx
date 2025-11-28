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
        <footer className="border-t bg-background">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="flex flex-col gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/files/chat-generated-images/project-x3quk5sxm0hbi1h6kufdz/a59ed40e-46b9-49c6-ba5b-9c1d232290de.png"
                                alt="GoTodoBanana logo"
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

                    {/* Contact */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold">Get Started</h3>
                        <p className="text-sm text-muted-foreground">
                            Ready to boost your productivity? Create your free account today!
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} GoTodoBanana. All rights reserved.
                </div>
            </div>
        </footer>
    );
}