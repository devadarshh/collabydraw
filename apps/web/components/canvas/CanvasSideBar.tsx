"use client";

import React, { useEffect } from "react";
import { X, Settings, Paintbrush } from "lucide-react";
import { PropertiesPanel } from "./PropertiesPanel";
import { ResponsiveSidebar } from "@/components/canvas/ResponsiveSideBar";
import { InfoSidebar } from "./InfoSidebar";
import * as fabric from "fabric";
import { ShapeType, tools } from "@/types/tools";

interface CanvasSidebarProps {
  showPropertiesPanel: boolean;
  setShowPropertiesPanel: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTool: ShapeType;
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
  useEffect(() => {
    const toolsWithProperties = tools
      .map((t) => t.id)
      .filter((id) => !["select", "eraser", "grab"].includes(id));

    if (toolsWithProperties.includes(selectedTool)) {
      setShowPropertiesPanel(window.innerWidth >= 640);
    } else {
      setShowPropertiesPanel(false);
    }
  }, [selectedTool, setShowPropertiesPanel]);

  // Zoom handlers
  const handleZoomIn = () => {
    if (canvas) {
      canvas.setZoom(canvas.getZoom() * 1.1);
      setZoom(Math.round(canvas.getZoom() * 100));
    }
  };

  const handleZoomOut = () => {
    if (canvas) {
      canvas.setZoom(canvas.getZoom() / 1.1);
      setZoom(Math.round(canvas.getZoom() * 100));
    }
  };

  const handleResetZoom = () => {
    if (canvas) {
      canvas.setZoom(1);
      setZoom(100);
    }
  };

  return (
    <>
      {/* --- Desktop Properties Panel (left sidebar) --- */}
      <div
        className={`fixed top-0 mt-28 left-0 z-40 bg-richblack-800 text-yellow-400 shadow-lg transform transition-transform duration-300 hidden sm:block
          ${showPropertiesPanel ? "translate-x-0" : "-translate-x-full"}`}
      >
        <PropertiesPanel
          selectedTool={selectedTool}
          onClose={() => setShowPropertiesPanel(false)}
        />
      </div>
      {/* --- Mobile Properties Panel (bottom sheet) --- */}
      <div
        className={`fixed bottom-0 left-0 w-full z-[9999] transform transition-transform duration-300 sm:hidden
          ${showPropertiesPanel ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="w-full max-h-[80vh] p-4 shadow-lg bg-richblack-800 text-yellow-400 rounded-t-2xl overflow-y-auto">
          <PropertiesPanel
            selectedTool={selectedTool}
            onClose={() => setShowPropertiesPanel(false)}
          />
        </div>
      </div>
      {/* --- Desktop InfoSidebar (right sidebar) --- */}
      <div
        className={`hidden sm:flex sm:flex-col sm:fixed sm:top-0 sm:right-0 sm:h-screen sm:w-78 z-40 transition-transform duration-300
          ${showSidebar ? "translate-x-0" : "translate-x-full"}`}
      >
        <InfoSidebar />
      </div>
      {/* --- Mobile InfoSidebar (bottom sheet) --- */}
      <div
        className={`fixed bottom-0 left-0 w-full z-40 transition-transform duration-300 sm:hidden h-3/4 shadow-lg overflow-y-auto bg-white dark:bg-[#1e1e1e] border-t border-[#605ebc33]
          ${showSidebar ? "translate-y-0" : "translate-y-full"}`}
      >
        <InfoSidebar />
      </div>
      {/* --- Desktop Settings Button --- */}
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
      {/* --- Mobile Bottom Navbar --- */}
      <div className="fixed bottom-0 left-0 w-full sm:hidden bg-richblack-800 border-t border-richblack-700 text-[#605ebc] flex justify-around items-center py-2 z-[9999]">
        <button
          onClick={() => setShowSidebar((prev) => !prev)}
          className="flex flex-col items-center hover:text-[#8d8bd6]"
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs">Settings</span>
        </button>

        <button
          onClick={() => setShowPropertiesPanel(true)}
          className="flex flex-col items-center hover:text-[#8d8bd6]"
        >
          <Paintbrush className="w-6 h-6" />
          <span className="text-xs">Style</span>
        </button>
      </div>{" "}
      <ResponsiveSidebar
        zoomIn={handleZoomIn}
        zoomOut={handleZoomOut}
        resetZoom={handleResetZoom}
        zoom={zoom}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
      />
    </>
  );
};
