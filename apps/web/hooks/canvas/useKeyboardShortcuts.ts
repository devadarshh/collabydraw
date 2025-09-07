"use client";
import { useEffect } from "react";
import { ShapeType } from "@/types/tools";

interface UseShortcutKeysProps {
  handleAddShapes: (tool: ShapeType) => void;
}

export function useShortcutKeys({ handleAddShapes }: UseShortcutKeysProps) {
  useEffect(() => {
    const handleShortcutKeys = (e: KeyboardEvent) => {
      const shortcutMap: Record<string, ShapeType> = {
        "1": "select",
        "2": "rectangle",
        "3": "ellipse",
        "4": "diamond",
        "5": "line",
        "6": "freeDraw",
        "7": "arrow",
        "8": "text",
        "9": "eraser",
        "0": "grab",
      };

      const tool = shortcutMap[e.key];
      if (tool) handleAddShapes(tool);
    };

    window.addEventListener("keydown", handleShortcutKeys);
    return () => window.removeEventListener("keydown", handleShortcutKeys);
  }, [handleAddShapes]);
}
