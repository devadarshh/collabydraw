"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
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

function CanvasPageContent() {
  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get("room");
  const { isFirstVisit, dismiss } = useFirstVisit("hasSeenWelcome");
  const { startDemo, isLoading: isDemoLoading } = useDemoSession();

  const handleTryDemo = () => {
    startDemo({ dismissWelcome: dismiss });
  };

  const showWelcome = isFirstVisit && !roomFromUrl;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex-1 relative">
        <CanvasBoard />
        {showWelcome && (
          <WelcomeOverlay
            onDismiss={dismiss}
            onTryDemo={handleTryDemo}
            isDemoLoading={isDemoLoading}
          />
        )}
      </div>
    </div>
  );
}

const CanvasPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen overflow-hidden">
          <div className="flex-1 relative">
            <CanvasBoard />
          </div>
        </div>
      }
    >
      <CanvasPageContent />
    </Suspense>
  );
};

export default CanvasPage;
