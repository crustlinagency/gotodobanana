import { useEffect } from "react";

interface CompletionCelebrationProps {
  show: boolean;
  onComplete: () => void;
}

export default function CompletionCelebration({ show, onComplete }: CompletionCelebrationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="text-6xl animate-bounce-subtle">
        🎉
      </div>
      
      {/* Confetti particles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full animate-confetti"
            style={{
              backgroundColor: [
                "#FFD93D",
                "#8B5CF6",
                "#F59E0B",
                "#10B981",
                "#3B82F6",
                "#EC4899",
                "#6366F1",
                "#F97316",
              ][i],
              animationDelay: `${i * 0.1}s`,
              transform: `rotate(${i * 45}deg) translateX(0)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}