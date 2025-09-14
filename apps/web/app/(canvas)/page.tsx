"use client";

import CanvasBoard from "@/components/canvas/CanvasBoard";
import { useFirstVisit } from "@/hooks/useFirstVisit";
import dynamic from "next/dynamic";

const WelcomeOverlay = dynamic(
  () =>
    import("@/components/canvas/WelcomeOverlay").then(
      (mod) => mod.WelcomeOverlay
    ),
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

const CanvasPage = () => {
  const { isFirstVisit, dismiss } = useFirstVisit("hasSeenWelcome");
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex-1">
        <CanvasBoard />
        {isFirstVisit && <WelcomeOverlay onDismiss={dismiss} />}
      </div>
    </div>
  );
};

export default CanvasPage;
