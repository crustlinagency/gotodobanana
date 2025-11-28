import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    itemName?: string;
    isPermanent?: boolean;
}

export default function DeleteConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    itemName,
    isPermanent = false,
}: DeleteConfirmDialogProps) {
    const defaultTitle = isPermanent 
        ? "Permanently Delete Task?" 
        : "Move to Trash?";
    
    const defaultDescription = isPermanent
        ? `This will permanently delete "${itemName || 'this task'}". This action is irreversible and cannot be undone.`
        : `"${itemName || 'This task'}" will be moved to trash and automatically deleted after 7 days. You can restore it from the Trash before then.`;

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${isPermanent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                            <AlertTriangle className={`h-6 w-6 ${isPermanent ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
                        </div>
                        <AlertDialogTitle>{title || defaultTitle}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="pt-4">
                        {description || defaultDescription}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={isPermanent ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700"}
                    >
                        {isPermanent ? "Delete Forever" : "Move to Trash"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}