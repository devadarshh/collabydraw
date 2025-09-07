"use client";

import React from "react";
import { Plus, Minus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

interface ZoomControlProps {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  zoom: number | string;
}

export const ZoomControl: React.FC<ZoomControlProps> = ({
  zoomIn,
  zoomOut,
  resetZoom,
  zoom,
}) => {
  const { theme } = useTheme();

  const bgClass =
    theme === "dark"
      ? "bg-[#1e1e1e] text-[#8d8bd6] border-[#605ebc33] hover:bg-[#605ebc22]"
      : "bg-white text-[#605ebc] border-[#605ebc33] hover:bg-[#8d8bd622]";

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg border ${bgClass} shadow-md`}
    >
      <Button
        size="sm"
        className={`flex items-center justify-center p-2 ${bgClass}`}
        onClick={zoomOut}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <div className="text-sm font-semibold w-12 text-center">{zoom}%</div>
      <Button
        size="sm"
        className={`flex items-center justify-center p-2 ${bgClass}`}
        onClick={zoomIn}
      >
        <Plus className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        className={`flex items-center justify-center p-2 ${bgClass}`}
        onClick={resetZoom}
      >
        <RefreshCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};
