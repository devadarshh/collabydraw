"use client";

import React, { useEffect } from "react";
import { X, Settings, Paintbrush } from "lucide-react";
import { PropertiesPanel } from "./PropertiesPanel";
import { ResponsiveSidebar } from "@/components/canvas/ResponsiveSideBar";
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
  console.log("CanvasSidebar received selectedTool:", selectedTool);

  useEffect(() => {
    // All tools except "select", "eraser", and "grab" should open properties
    const toolsWithProperties = tools
      .map((t) => t.id)
      .filter((id) => !["select", "eraser", "grab"].includes(id));

    if (toolsWithProperties.includes(selectedTool)) {
      if (window.innerWidth >= 640) {
        setShowPropertiesPanel(true); // desktop auto open
      } else {
        setShowPropertiesPanel(false); // mobile closed by default
      }
    } else {
      setShowPropertiesPanel(false);
    }
  }, [selectedTool, setShowPropertiesPanel]);

  return (
    <>
      {/* --- Properties Panel (Mobile: bottom sheet) --- */}
      <div
        className={`fixed bottom-0 left-0 w-full z-[99999] transform transition-transform duration-300 ease-in-out sm:hidden
          ${showPropertiesPanel ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="w-full max-h-[80vh] p-4 shadow-lg bg-richblack-800 text-yellow-400 rounded-t-2xl overflow-y-auto">
          <PropertiesPanel
            selectedTool={selectedTool}
            onClose={() => setShowPropertiesPanel(false)}
            className="w-full"
          />
        </div>
      </div>

      {/* --- Properties Panel (Tablet/Desktop: left sidebar) --- */}
      <div
        className={`fixed top-0 mt-10 left-0 h-full w-70 z-40 bg-richblack-800 text-yellow-400 shadow-lg transform transition-transform duration-300 hidden sm:block
          ${showPropertiesPanel ? "translate-x-0" : "-translate-x-full"}`}
      >
        <PropertiesPanel
          selectedTool={selectedTool}
          onClose={() => setShowPropertiesPanel(false)}
          className="h-full w-full p-4 overflow-y-auto"
        />
      </div>

      {/* --- Desktop Settings Toggle --- */}
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

      {/* --- Bottom Navbar (Mobile only) --- */}
      <div className="fixed bottom-0 left-0 w-full sm:hidden bg-richblack-800 border-t border-richblack-700 text-[#605ebc] flex justify-around items-center py-2 z-[9999]">
        {/* Settings Button */}
        <button
          onClick={() => setShowSidebar((prev) => !prev)}
          className="flex flex-col items-center hover:text-[#8d8bd6]"
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs">Settings</span>
        </button>

        {/* Paint Button */}
        <button
          onClick={() => setShowPropertiesPanel(true)}
          className="flex flex-col items-center hover:text-[#8d8bd6]"
        >
          <Paintbrush className="w-6 h-6" />
          <span className="text-xs">Style</span>
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col items-center">
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
        </div>
      </div>
    </>
  );
};
