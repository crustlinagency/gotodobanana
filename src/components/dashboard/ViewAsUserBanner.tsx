import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ViewAsUserBannerProps {
    userName: string;
    onExit: () => void;
}

export default function ViewAsUserBanner({ userName, onExit }: ViewAsUserBannerProps) {
    const navigate = useNavigate();

    const handleExit = () => {
        onExit();
        navigate("/admin");
    };

    return (
        <Alert className="border-banana-500 bg-banana-50 dark:bg-banana-950 mb-4">
            <Eye className="h-4 w-4 text-banana-600" />
            <AlertDescription className="flex items-center justify-between">
                <span className="text-sm font-medium">
                    <strong>Admin View:</strong> You are viewing the dashboard as{" "}
                    <span className="text-banana-600">{userName}</span>
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExit}
                    className="ml-4"
                >
                    <X className="h-3 w-3 mr-1" />
                    Exit View
                </Button>
            </AlertDescription>
        </Alert>
    );
}