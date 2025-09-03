"use client";

import React from "react";
import { ShapeType } from "../../types";
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
  Hand,
  ArrowRight,
  EraserIcon,
  PencilIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolBarProps {
  selectedShape: ShapeType;
  onAddShape: (type: ShapeType) => void;
}

const tools: {
  type: ShapeType;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}[] = [
  {
    type: "select",
    label: "Select",
    shortcut: "1",
    icon: <MousePointer size={16} />,
  },
  { type: "grab", label: "Grab", shortcut: "2", icon: <Hand size={16} /> },
  {
    type: "rectangle",
    label: "Rectangle",
    shortcut: "3",
    icon: <Square size={16} />,
  },
  {
    type: "ellipse",
    label: "Ellipse",
    shortcut: "4",
    icon: <Circle size={16} />,
  },
  {
    type: "diamond",
    label: "Diamond",
    shortcut: "5",
    icon: <Diamond size={16} />,
  },
  { type: "line", label: "Line", shortcut: "6", icon: <Minus size={16} /> },
  {
    type: "freeDraw",
    label: "FreeDraw",
    shortcut: "7",
    icon: <PencilIcon size={16} />,
  },
  {
    type: "arrow",
    label: "Arrow",
    shortcut: "8",
    icon: <ArrowRight size={16} />,
  },
  { type: "text", label: "Text", shortcut: "9", icon: <Type size={16} /> },
  {
    type: "eraser",
    label: "Eraser",
    shortcut: "0",
    icon: <EraserIcon size={16} />,
  },
];

const ToolBar: React.FC<ToolBarProps> = ({ selectedShape, onAddShape }) => {
  return (
    <TooltipProvider delayDuration={0}>
      <header className="flex items-center gap-1.5 p-2 bg-white/90 dark:bg-zinc-900 shadow rounded-lg">
        <div className="flex items-center gap-1.5">
          {tools.map((tool) => (
            <Tooltip key={tool.type}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => onAddShape(tool.type)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer relative transition-all duration-200",
                    "hover:bg-gray-200 dark:hover:bg-zinc-800",
                    selectedShape === tool.type
                      ? "bg-indigo-500 text-white hover:bg-indigo-600"
                      : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  {tool.icon}
                  <span className="absolute -bottom-1 right-0.5 text-[9px] text-gray-500 dark:text-gray-400">
                    {tool.shortcut}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-sm">
                {tool.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </header>
    </TooltipProvider>
  );
};

export default ToolBar;
