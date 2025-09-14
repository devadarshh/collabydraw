"use client";

import { Settings } from "lucide-react";
import { ZoomControl } from "@/components/canvas/ZoomControl";
import { InfoSidebar } from "@/components/layout/InfoSidebar";
import { cn } from "@/lib/utils";

interface ResponsiveSidebarProps {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  zoom: number;
  showSidebar: boolean;
}

export function ResponsiveSidebar({
  zoomIn,
  zoomOut,
  resetZoom,
  zoom,
  showSidebar,
}: ResponsiveSidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed left-0 right-0 bottom-0 z-40 transition-transform duration-300 sm:hidden h-3/4 shadow-lg overflow-y-auto bg-white dark:bg-[#1e1e1e] border-t border-[#605ebc33]",
          showSidebar ? "translate-y-0" : "translate-y-full"
        )}
      >
        <InfoSidebar />
      </div>

      <div
        className={cn(
          "hidden sm:flex sm:flex-col sm:fixed sm:top-0 sm:right-0 sm:h-screen sm:w-80 z-40 transition-transform duration-300",
          showSidebar ? "translate-x-0" : "translate-x-full"
        )}
      >
        <InfoSidebar />
      </div>

      <div className="hidden sm:flex flex-col fixed left-6 bottom-6 z-[999] gap-2">
        <ZoomControl
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetZoom={resetZoom}
          zoom={zoom}
        />
      </div>
    </>
  );
}
