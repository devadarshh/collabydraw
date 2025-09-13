"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShapeType, tools } from "@/types/tools";

interface ToolbarProps {
  activeTool: ShapeType;
  onToolChange: (toolId: ShapeType) => void;
}

export const Toolbar = ({ activeTool, onToolChange }: ToolbarProps) => {
  return (
    <div className="floating-toolbar">
      <TooltipProvider>
        <div
          className="
    flex flex-nowrap justify-center items-center gap-3
    w-full max-w-[700px] bg-background/95 backdrop-blur-sm 
    rounded-lg px-2 py-1.5 shadow-xl border border-border overflow-x-auto
  "
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
