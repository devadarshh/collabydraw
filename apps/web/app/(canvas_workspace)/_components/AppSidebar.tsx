"use client";
import { useState } from "react";
import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Type,
  Image,
  Eraser,
  PenTool,
  Triangle,
  Diamond,
  Hexagon,
  Star,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  shortcut?: string;
  group: "selection" | "shapes" | "drawing" | "actions" | "settings";
}

const tools: Tool[] = [
  // Selection tools
  {
    id: "selection",
    name: "Selection",
    icon: MousePointer2,
    shortcut: "V",
    group: "selection",
  },
  { id: "hand", name: "Hand", icon: Hand, shortcut: "H", group: "selection" },

  // Shape tools
  {
    id: "rectangle",
    name: "Rectangle",
    icon: Square,
    shortcut: "R",
    group: "shapes",
  },
  {
    id: "ellipse",
    name: "Ellipse",
    icon: Circle,
    shortcut: "O",
    group: "shapes",
  },
  {
    id: "arrow",
    name: "Arrow",
    icon: ArrowUpRight,
    shortcut: "A",
    group: "shapes",
  },
  { id: "line", name: "Line", icon: Minus, shortcut: "L", group: "shapes" },
  {
    id: "triangle",
    name: "Triangle",
    icon: Triangle,
    shortcut: "T",
    group: "shapes",
  },
  {
    id: "diamond",
    name: "Diamond",
    icon: Diamond,
    shortcut: "D",
    group: "shapes",
  },
  { id: "hexagon", name: "Hexagon", icon: Hexagon, group: "shapes" },
  { id: "star", name: "Star", icon: Star, group: "shapes" },

  // Drawing tools
  { id: "pen", name: "Draw", icon: PenTool, shortcut: "P", group: "drawing" },
  { id: "text", name: "Text", icon: Type, shortcut: "T", group: "drawing" },
  { id: "image", name: "Image", icon: Image, shortcut: "I", group: "drawing" },
  {
    id: "eraser",
    name: "Eraser",
    icon: Eraser,
    shortcut: "E",
    group: "drawing",
  },

  // Action tools
  { id: "undo", name: "Undo", icon: Undo2, shortcut: "⌘Z", group: "actions" },
  { id: "redo", name: "Redo", icon: Redo2, shortcut: "⌘⇧Z", group: "actions" },
  { id: "clear", name: "Clear canvas", icon: Trash2, group: "actions" },
  { id: "export", name: "Export", icon: Download, group: "actions" },
];

export interface AppSidebarProps {
  selectedTool?: string;
  onToolSelect?: (toolId: string) => void;
  className?: string;
}

export function AppSidebar({
  selectedTool = "selection",
  onToolSelect = () => {},
  className,
}: AppSidebarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const renderToolGroup = (groupName: string, groupTools: Tool[]) => (
    <div key={groupName} className="mb-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {groupTools.map((tool) => {
          const isActive = selectedTool === tool.id;
          const Icon = tool.icon;

          return (
            <div key={tool.id} className="relative group">
              <button
                onClick={() => onToolSelect(tool.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center space-y-1",
                  "w-10 h-12 rounded-md",
                  "transition-all duration-150 ease-out",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                  "bg-tool-bg hover:bg-blue-50", // lighter hover background
                  "border border-transparent", // default border
                  selectedTool === tool.id &&
                    "bg-gradient-to-br from-blue-400 to-blue-200 text-white border-blue-500 shadow-lg scale-105", // active
                  "hover:border-blue-400"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors duration-150",
                    selectedTool === tool.id
                      ? "text-white"
                      : "text-gray-800 dark:text-gray-200 group-hover:text-blue-500" // visible in light/dark mode
                  )}
                />
                {tool.shortcut && (
                  <span
                    className={cn(
                      "text-[10px] leading-tight",
                      selectedTool === tool.id
                        ? "text-white font-semibold"
                        : "text-gray-700 dark:text-gray-300" // visible in light/dark mode
                    )}
                  >
                    {tool.shortcut}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              <span
                className="absolute left-full top-1/2 -translate-y-1/2 ml-2 
         whitespace-nowrap rounded-md bg-blue-500 text-white 
         px-2 py-1 text-xs opacity-0 group-hover:opacity-100 
         transition-opacity duration-200 shadow-lg z-50"
              >
                {tool.name}
              </span>
            </div>
          );
        })}
      </div>

      {groupName !== "settings" && <div className="h-2" />}
    </div>
  );

  const groupedTools = tools.reduce(
    (acc, tool) => {
      if (!acc[tool.group]) acc[tool.group] = [];
      acc[tool.group]?.push(tool);
      return acc;
    },
    {} as Record<string, Tool[]>
  );

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen",
        "bg-sidebar-bg border-r border-sidebar-border",
        "p-2",
        "w-20 sm:w-21 md:w-23", // <--- responsive widths
        className
      )}
    >
      {/* Logo area */}
      <div className="flex items-center justify-center h-12 mb-2">
        {" "}
        {/* was mb-4 */}
        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
          C
        </div>
      </div>

      {/* Tool groups */}
      <div className="flex-1 space-y-1 pt-4">
        {" "}
        {/* added pt-4 */}
        {renderToolGroup("selection", groupedTools.selection || [])}
        {renderToolGroup("shapes", groupedTools.shapes || [])}
        {renderToolGroup("drawing", groupedTools.drawing || [])}
        {renderToolGroup("actions", groupedTools.actions || [])}
      </div>

      {/* Settings and theme toggle at bottom */}
      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <div className="grid grid-cols-2 gap-1 mb-2">
          <button
            onClick={() => onToolSelect("settings")}
            className={cn(
              "group relative flex items-center justify-center",
              "w-10 h-10 rounded-md",
              "bg-tool-bg hover:bg-tool-bg-hover",
              "border border-transparent",
              "transition-all duration-150 ease-out",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            )}
            title="Settings"
          >
            <Settings className="w-4 h-4 text-tool-icon group-hover:text-tool-icon-hover transition-colors duration-150" />
          </button>

          <button
            onClick={toggleTheme}
            className={cn(
              "group relative flex items-center justify-center",
              "w-10 h-10 rounded-md",
              "bg-tool-bg hover:bg-tool-bg-hover",
              "border border-transparent",
              "transition-all duration-150 ease-out",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            )}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-tool-icon group-hover:text-tool-icon-hover transition-colors duration-150" />
            ) : (
              <Moon className="w-4 h-4 text-tool-icon group-hover:text-tool-icon-hover transition-colors duration-150" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
