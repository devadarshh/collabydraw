"use client";

import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { ShapeType } from "@/types/tools";

interface UseShortcutKeysProps {
  handleAddShapes: (tool: ShapeType) => void;
  activeTool: ShapeType;
  canvas: fabric.Canvas | null;
}

function isTypingContext(canvas: fabric.Canvas | null): boolean {
  const el = document.activeElement;
  if (el) {
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if ((el as HTMLElement).isContentEditable) return true;
  }

  const active = canvas?.getActiveObject() as fabric.IText | undefined;
  return Boolean(active?.isEditing);
}

export function useShortcutKeys({
  handleAddShapes,
  activeTool,
  canvas,
}: UseShortcutKeysProps): void {
  const activeToolRef = useRef(activeTool);
  const previousToolRef = useRef<ShapeType>("select");
  const isSpaceGrabActiveRef = useRef(false);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    const handleShortcutKeys = (e: KeyboardEvent): void => {
      if (isTypingContext(canvas)) return;

      if (e.code === "Space" || e.key === " ") {
        if (e.type === "keydown") {
          if (e.repeat || isSpaceGrabActiveRef.current) return;
          e.preventDefault();
          previousToolRef.current = activeToolRef.current;
          isSpaceGrabActiveRef.current = true;
          handleAddShapes("grab");
        }
        return;
      }

      if (e.type !== "keydown") return;

      const shortcutMap: Record<string, ShapeType> = {
        "1": "select",
        "2": "rectangle",
        "3": "ellipse",
        "4": "triangle",
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

    const handleSpaceKeyUp = (e: KeyboardEvent): void => {
      if (e.code !== "Space" && e.key !== " ") return;
      if (!isSpaceGrabActiveRef.current) return;

      e.preventDefault();
      isSpaceGrabActiveRef.current = false;
      handleAddShapes(previousToolRef.current);
    };

    const handleWindowBlur = (): void => {
      if (!isSpaceGrabActiveRef.current) return;
      isSpaceGrabActiveRef.current = false;
      handleAddShapes(previousToolRef.current);
    };

    window.addEventListener("keydown", handleShortcutKeys);
    window.addEventListener("keyup", handleSpaceKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("keydown", handleShortcutKeys);
      window.removeEventListener("keyup", handleSpaceKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [handleAddShapes, canvas]);
}
