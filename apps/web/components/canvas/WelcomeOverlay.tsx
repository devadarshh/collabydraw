"use client";

import React from "react";
import { Settings, Square, Circle } from "lucide-react";
import { Button } from "../ui/button";

interface WelcomeOverlayProps {
  onDismiss: () => void;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({
  onDismiss,
}) => {
  const primaryColor = "bg-[#8d8bd6] text-[#8d8bd6]";

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/5 backdrop-blur-sm">
      <div className="text-center max-w-md sm:max-w-lg md:max-w-xl animate-fade-in px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div
            className={`w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center shadow-lg ${primaryColor}`}
          >
            <div className="w-7 h-7 md:w-8 md:h-8 rounded transform rotate-45 bg-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide font-[Bebas_Neue] text-[#8d8bd6]">
            COLLABYDRAW
          </h1>
        </div>

        <p className="mb-6 text-lg sm:text-xl md:text-2xl font-semibold text-gray-700">
          Draw, collaborate & save locally.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="hidden sm:flex flex-col items-center p-3 bg-white/20 backdrop-blur-sm rounded-lg shadow-sm">
            <Square size={24} className="text-[#8d8bd6]" />
            <span className="mt-2 text-sm font-semibold text-[#8d8bd6] text-center">
              Toolbar → Properties
            </span>
          </div>

          <div className="flex sm:hidden flex-col items-center p-3 bg-white/20 backdrop-blur-sm rounded-lg shadow-sm">
            <Square size={24} className="text-[#8d8bd6]" />
            <span className="mt-2 text-sm font-semibold text-[#8d8bd6] text-center">
              Bottom Bar → Properties
            </span>
          </div>

          <div className="flex flex-col items-center p-3 bg-white/20 backdrop-blur-sm rounded-lg shadow-sm">
            <Settings size={24} className="text-[#8d8bd6]" />
            <span className="mt-2 text-sm font-semibold text-[#8d8bd6] text-center whitespace-nowrap">
              Settings → Collaboration
            </span>
          </div>

          <div className="flex flex-col items-center p-3 bg-white/20 backdrop-blur-sm rounded-lg shadow-sm">
            <Circle size={24} className="text-[#8d8bd6]" />
            <span className="mt-2 text-sm font-semibold text-[#8d8bd6] text-center">
              Instant & Local
            </span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Button
            onClick={onDismiss}
            className="px-6 py-2 text-white font-semibold rounded shadow hover:brightness-110 transition cursor-pointer"
            style={{ backgroundColor: "#8d8bd6" }}
          >
            Start Drawing
          </Button>
        </div>
      </div>
    </div>
  );
};
