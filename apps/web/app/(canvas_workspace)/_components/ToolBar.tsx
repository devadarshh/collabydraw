"use client";
import {
  MousePointer2,
  Square,
  Circle,
  Diamond,
  Minus,
  Type,
  Pen,
  Eraser,
  Hand,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect } from "react";
import { ShapeType } from "@/types/tools";

interface Tool {
  id: ShapeType;
  name: string;
  icon: any;
  shortcut: string;
  description: string;
}

const tools: Tool[] = [
  {
    id: "select",
    name: "Select",
    icon: MousePointer2,
    shortcut: "1",
    description: "Select (1)",
  },
  {
    id: "rectangle",
    name: "Rectangle",
    icon: Square,
    shortcut: "2",
    description: "Rectangle (2)",
  },
  {
    id: "ellipse",
    name: "Ellipse",
    icon: Circle,
    shortcut: "3",
    description: "Ellipse (3)",
  },
  {
    id: "diamond",
    name: "Diamond",
    icon: Diamond,
    shortcut: "4",
    description: "Diamond (4)",
  },
  {
    id: "line",
    name: "Line",
    icon: Minus,
    shortcut: "5",
    description: "Line (5)",
  },
  {
    id: "freeDraw",
    name: "Free Draw",
    icon: Pen,
    shortcut: "6",
    description: "Free Draw (6)",
  },
  {
    id: "arrow",
    name: "Arrow",
    icon: ArrowRight,
    shortcut: "7",
    description: "Arrow (7)",
  },
  {
    id: "text",
    name: "Text",
    icon: Type,
    shortcut: "8",
    description: "Text (8)",
  },
  {
    id: "eraser",
    name: "Eraser",
    icon: Eraser,
    shortcut: "9",
    description: "Eraser (9)",
  },
  {
    id: "grab",
    name: "Grab",
    icon: Hand,
    shortcut: "0",
    description: "Grab (0)",
  },
];

interface ToolbarProps {
  activeTool: ShapeType;
  onToolChange: (toolId: ShapeType) => void;
}

export const Toolbar = ({ activeTool, onToolChange }: ToolbarProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tool = tools.find((t) => t.shortcut === e.key);
      if (tool) onToolChange(tool.id);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToolChange]);

  return (
    <div className="floating-toolbar">
      <TooltipProvider>
        <div
          className="flex flex-nowrap justify-center items-center gap-1 
                        bg-background/95 backdrop-blur-sm rounded-lg px-1 py-1 sm:px-2 sm:py-2 
                        shadow-xl border border-border overflow-x-auto"
        >
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`
    relative w-6 h-6 sm:w-10 sm:h-10 p-0 
    flex items-center justify-center 
    text-[10px] sm:text-sm cursor-pointer
    transition-colors
    hover:bg-indigo-500/20 hover:text-indigo-700
    ${activeTool === tool.id ? "bg-indigo-500/30 text-indigo-700" : ""}
  `}
                  onClick={() => onToolChange(tool.id)}
                >
                  <tool.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span
                    className="hidden sm:inline absolute -bottom-1 -right-1 
                   text-[10px] sm:text-xs bg-muted text-muted-foreground 
                   rounded px-1 leading-none"
                  >
                    {tool.shortcut}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{tool.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};
