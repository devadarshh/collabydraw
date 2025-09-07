"use client";

import React from "react";
import { X, Settings } from "lucide-react";
import { PropertiesPanel } from "./PropertiesPanel";
import { ResponsiveSidebar } from "@/components/canvas/ResponsiveSideBar";
import * as fabric from "fabric";

interface CanvasSidebarProps {
  showPropertiesPanel: boolean;
  setShowPropertiesPanel: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTool: string;
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  canvas: fabric.Canvas | null;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
}

export const CanvasSidebar: React.FC<CanvasSidebarProps> = ({
  showPropertiesPanel,
  setShowPropertiesPanel,
  selectedTool,
  showSidebar,
  setShowSidebar,
  canvas,
  zoom,
  setZoom,
}) => {
  return (
    <>
      {/* Properties Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-popover border-r border-border shadow-lg transform transition-transform duration-300 z-50
        ${showPropertiesPanel ? "translate-x-0" : "-translate-x-full"}`}
      >
        <PropertiesPanel
          selectedTool={selectedTool}
          onClose={() => setShowPropertiesPanel(false)}
          className="h-full overflow-y-auto"
        />
      </div>

      {/* Settings Toggle */}
      <div className="absolute top-4 right-4 z-50 hidden sm:block">
        <button
          onClick={() => setShowSidebar((prev) => !prev)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-md transition-colors ${
            showSidebar
              ? "bg-gradient-to-r from-[#605ebc] to-[#605ebc] text-white"
              : "hover:bg-gradient-to-r hover:from-[#8d8bd6] hover:to-[#8d8bd6] hover:text-white"
          }`}
        >
          {showSidebar ? (
            <X className="w-4 h-4" />
          ) : (
            <Settings className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {showSidebar ? "Close" : "Settings"}
          </span>
        </button>
      </div>

      <ResponsiveSidebar
        zoomIn={() => {
          if (canvas) {
            canvas.setZoom(canvas.getZoom() * 1.1);
            setZoom(Math.round(canvas.getZoom() * 100));
          }
        }}
        zoomOut={() => {
          if (canvas) {
            canvas.setZoom(canvas.getZoom() / 1.1);
            setZoom(Math.round(canvas.getZoom() * 100));
          }
        }}
        resetZoom={() => {
          if (canvas) {
            canvas.setZoom(1);
            setZoom(100);
          }
        }}
        zoom={zoom}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
      />
    </>
  );
};
