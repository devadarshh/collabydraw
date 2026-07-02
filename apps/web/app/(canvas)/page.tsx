"use client";

import dynamic from "next/dynamic";
import { useFirstVisit } from "@/hooks/useFirstVisit";
import { useDemoSession } from "@/hooks/auth/useDemoSession";

const WelcomeOverlay = dynamic(
  async () =>
    (await import("@/components/canvas/WelcomeOverlay")).WelcomeOverlay,
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/5 backdrop-blur-sm">
        <p className="text-lg font-semibold text-[#8d8bd6]">
          Loading overlay...
        </p>
      </div>
    ),
  }
);

const CanvasBoard = dynamic(
  async () => await import("@/components/canvas/CanvasBoard"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/5 backdrop-blur-sm">
        <p className="text-lg font-semibold text-[#8d8bd6]">
          Loading overlay...
        </p>
      </div>
    ),
  }
);

const CanvasPage: React.FC = () => {
  const { isFirstVisit, dismiss } = useFirstVisit("hasSeenWelcome");
  const { startDemo, isLoading: isDemoLoading } = useDemoSession();

  const handleTryDemo = () => {
    startDemo({ dismissWelcome: dismiss });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex-1 relative">
        <CanvasBoard />
        {isFirstVisit && (
          <WelcomeOverlay
            onDismiss={dismiss}
            onTryDemo={handleTryDemo}
            isDemoLoading={isDemoLoading}
          />
        )}
      </div>
    </div>
  );
};

export default CanvasPage;
