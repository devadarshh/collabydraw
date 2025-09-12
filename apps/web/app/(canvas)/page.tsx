"use client";
import CanvasBoard from "@/components/canvas/CanvasBoard";
import { WelcomeOverlay } from "@/components/canvas/WelcomeOverlay";
import { useEffect, useState } from "react";

const CanvasPage = () => {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");

    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowWelcome(false);
    localStorage.setItem("hasSeenWelcome", "true");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex-1">
        <CanvasBoard />
        {showWelcome && <WelcomeOverlay onDismiss={handleDismiss} />}
      </div>
    </div>
  );
};

export default CanvasPage;
