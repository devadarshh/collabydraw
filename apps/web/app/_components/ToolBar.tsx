"use client";

import React from "react";
import { ShapeType } from "../../types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Square,
  Circle,
  Diamond,
  Minus,
  Type,
  MousePointer,
} from "lucide-react";

interface ToolBarProps {
  selectedShape: ShapeType;
  onAddShape: (type: ShapeType) => void;
}

const shapes: {
  type: ShapeType;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}[] = [
  {
    type: "rectangle",
    label: "Rectangle",
    shortcut: "R",
    icon: <Square size={16} />,
  },
  {
    type: "ellipse",
    label: "Ellipse",
    shortcut: "E",
    icon: <Circle size={16} />,
  },
  {
    type: "diamond",
    label: "Diamond",
    shortcut: "D",
    icon: <Diamond size={16} />,
  },
  { type: "line", label: "Line", shortcut: "L", icon: <Minus size={16} /> },
  { type: "text", label: "Text", shortcut: "T", icon: <Type size={16} /> },
  {
    type: "select",
    label: "Select",
    shortcut: "S",
    icon: <MousePointer size={16} />,
  },
];

const ToolBar: React.FC<ToolBarProps> = ({ selectedShape, onAddShape }) => {
  return (
    <TooltipProvider delayDuration={0}>
      <header className="Tool_Bar flex items-center gap-1 p-1.5 rounded-lg Island bg-white/80 dark:bg-zinc-900 shadow">
        <div className="flex items-center gap-1 lg:gap-3">
          {shapes.map((shape) => (
            <Tooltip key={shape.type}>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedShape === shape.type ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => onAddShape(shape.type)}
                  className={`xl:relative w-[30px] h-[30px] xs670:w-9 xs670:h-9 ${
                    selectedShape === shape.type
                      ? "bg-selected-tool-bg-light text-[var(--color-on-primary-container)] dark:bg-selected-tool-bg-dark dark:text-white"
                      : "text-icon-fill-color hover:text-icon-fill-color dark:text-icon-fill-color-d dark:hover:text-icon-fill-color-d hover:bg-light-btn-hover-bg dark:hover:bg-d-btn-hover-bg"
                  }`}
                >
                  {shape.icon}
                  <span className="sr-only">{shape.label}</span>
                  <span className="hidden xl:block absolute -bottom-1 right-1 text-[11px] text-black/60 dark:text-icon-fill-color-d">
                    {shape.shortcut}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{shape.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </header>
    </TooltipProvider>
  );
};

export default ToolBar;
