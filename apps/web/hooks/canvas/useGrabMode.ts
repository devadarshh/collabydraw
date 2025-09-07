"use client";

import { useEffect } from "react";
import * as fabric from "fabric";

interface UseGrabModeProps {
  canvas: fabric.Canvas | null;
  mode: "select" | "draw" | "eraser" | "freeDraw" | "grab" | null;
}

export const useGrabMode = ({ canvas, mode }: UseGrabModeProps) => {
  useEffect(() => {
    if (!canvas) return;

    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleMouseDown = (opt: fabric.TEvent<fabric.TPointerEvent>) => {
      if (mode === "grab") {
        isDragging = true;
        const evt = opt.e as MouseEvent;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        canvas.selection = false;
        canvas.defaultCursor = "grabbing";
      }
    };

    const handleMouseMove = (opt: fabric.TEvent<fabric.TPointerEvent>) => {
      if (isDragging && mode === "grab") {
        const e = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform!;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        canvas.requestRenderAll();
        lastPosX = e.clientX;
        lastPosY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      if (mode === "grab") {
        isDragging = false;
        canvas.defaultCursor = "grab";
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvas, mode]);
};
