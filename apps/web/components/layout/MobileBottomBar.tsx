"use client";

import React from "react";
import { Settings, Paintbrush } from "lucide-react";

import { ZoomControl } from "@/components/canvas/ZoomControl";
import { ShapeType } from "@/types/tools";
import { useWsStore } from "@/hooks/websocket/useWsStore";

interface MobileBottomBarProps {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  zoom: number;
  showSidebar: boolean;
  setShowSidebar: (value: boolean) => void;
  onOpenPropertiesPanel: () => void;
  selectedTool: ShapeType | null;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  zoomIn,
  zoomOut,
  resetZoom,
  zoom,
  showSidebar,
  setShowSidebar,
  onOpenPropertiesPanel,
  selectedTool,
}) => {
  const isConnected = useWsStore((state) => state.isConnected);

  const toolsWithProperties: ShapeType[] = [
    "rectangle",
    "ellipse",
    "line",
    "diamond",
    "arrow",
    "freeDraw",
    "text",
  ];

  const showPaintIcon =
    selectedTool && toolsWithProperties.includes(selectedTool);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center p-2 bg-richblack-800 border-t border-richblack-700 text-[#605ebc] sm:hidden">
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className={`flex items-center justify-center w-10 h-10 rounded-full ${
          isConnected ? "bg-green-600" : "bg-[#605ebc]"
        } text-white cursor-pointer transition hover:brightness-110`}
      >
        <Settings className="w-5 h-5" />
      </button>

      {showPaintIcon && (
        <button
          onClick={onOpenPropertiesPanel}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#605ebc] text-white cursor-pointer transition hover:brightness-110"
        >
          <Paintbrush className="w-5 h-5" />
        </button>
      )}

      <ZoomControl
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetZoom={resetZoom}
        zoom={zoom}
      />
    </div>
  );
};
