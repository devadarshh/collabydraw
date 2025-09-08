"use client";

import React, { useEffect } from "react";
import { X, Settings } from "lucide-react";
import { PropertiesPanel } from "./PropertiesPanel";
import { ResponsiveSidebar } from "@/components/canvas/ResponsiveSideBar";
import { InfoSidebar } from "./InfoSidebar";
import * as fabric from "fabric";
import { ShapeType, tools } from "@/types/tools";
import { MobileBottomBar } from "../MobileBottomBar";

interface CanvasSidebarProps {
  showPropertiesPanel: boolean;
  setShowPropertiesPanel: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTool: ShapeType;
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  canvas: fabric.Canvas | null;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  onClearCanvas?: () => void;
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
  onClearCanvas,
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
      {/* --- Desktop Properties Panel --- */}
      <div
        className={`fixed top-0 mt-28 left-0 z-40 bg-richblack-800 text-yellow-400 shadow-lg transform transition-transform duration-300 hidden sm:block
          ${showPropertiesPanel ? "translate-x-0" : "-translate-x-full"}`}
      >
        <PropertiesPanel
          selectedTool={selectedTool}
          onClose={() => setShowPropertiesPanel(false)}
        />
      </div>

      {/* --- Desktop InfoSidebar --- */}
      <div
        className={`hidden sm:flex sm:flex-col sm:fixed sm:top-0 sm:right-0 sm:h-screen sm:w-78 z-40 transition-transform duration-300
          ${showSidebar ? "translate-x-0" : "translate-x-full"}`}
      >
        <InfoSidebar onClearCanvas={onClearCanvas} />
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
      {/* --- Mobile Properties Panel --- */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-40 sm:hidden h-2/4 shadow-lg overflow-y-auto bg-richblack-800 text-yellow-400 border-t border-[#605ebc33] transform transition-transform duration-300 ${
          showPropertiesPanel ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <PropertiesPanel
          selectedTool={selectedTool}
          onClose={() => setShowPropertiesPanel(false)}
        />
      </div>

      {/* --- Mobile Bottom Bar --- */}
      <MobileBottomBar
        zoomIn={handleZoomIn}
        zoomOut={handleZoomOut}
        resetZoom={handleResetZoom}
        zoom={zoom}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        onOpenPropertiesPanel={() => setShowPropertiesPanel(true)}
        selectedTool={selectedTool} // <-- pass this
      />

      {/* --- Desktop Zoom Control --- */}
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
