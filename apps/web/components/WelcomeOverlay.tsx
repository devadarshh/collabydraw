"use client";

import { useWelcomeStore } from "@/hooks/useWelcomeStore";

export function WelcomeOverlay() {
  const { showWelcome, hideWelcome } = useWelcomeStore();
  //   const { activeTool } = useToolStore();

  // If user selects a tool, hide overlay
  //   if (activeTool !== "select" && showWelcome) {
  //     hideWelcome();
  //   }

  if (!showWelcome) return null;

  return (
    <div
      onClick={hideWelcome} // Hide on any click
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 text-white p-4 cursor-pointer"
    >
      <h1 className="text-4xl font-bold mb-4">ExcalDraw</h1>
      <p className="mb-8 text-center max-w-md">
        Click on any tool or anywhere on the canvas to start drawing!
      </p>

      <div className="flex gap-6">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 bg-white rounded-full mb-2"></div>
          <span>Toolbar</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-8 h-8 bg-white rounded-full mb-2"></div>
          <span>Canvas</span>
        </div>
      </div>

      <span className="mt-8 text-sm opacity-80">
        Click anywhere to continue
      </span>
    </div>
  );
}
