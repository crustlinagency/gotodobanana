import { useEffect } from "react";

interface KeyboardShortcuts {
    onNewTask?: () => void;
    onSearch?: () => void;
    onToggleFocus?: () => void;
}

export function useKeyboardShortcuts({
    onNewTask,
    onSearch,
    onToggleFocus,
}: KeyboardShortcuts) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore if user is typing in an input or textarea
            const target = event.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                return;
            }

            // Ctrl/Cmd + N: New Task
            if ((event.ctrlKey || event.metaKey) && event.key === "n") {
                event.preventDefault();
                onNewTask?.();
            }

            // Ctrl/Cmd + K: Search
            if ((event.ctrlKey || event.metaKey) && event.key === "k") {
                event.preventDefault();
                onSearch?.();
            }

            // Ctrl/Cmd + F: Toggle Focus Mode
            if ((event.ctrlKey || event.metaKey) && event.key === "f") {
                event.preventDefault();
                onToggleFocus?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onNewTask, onSearch, onToggleFocus]);
}