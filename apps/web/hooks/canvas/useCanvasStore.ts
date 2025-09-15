import { create } from "zustand";
import { toast } from "sonner";
import type { Canvas } from "fabric";

interface CanvasState {
  canvas: Canvas | null;
  backgroundColor: string;
  setCanvas: (canvas: Canvas) => void;
  clearCanvas: () => void;
  setBackgroundColor: (color: string) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  canvas: null,
  backgroundColor: "#ffffff",

  setCanvas: (canvas: Canvas) => set({ canvas }),

  clearCanvas: () => {
    const canvas = get().canvas;
    if (!canvas) return;

    const isDark =
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark");

    const bgColor = isDark ? "#121212" : "#ffffff";

    canvas.clear();
    canvas.backgroundColor = bgColor;
    canvas.renderAll();

    set({ backgroundColor: bgColor });
    toast.success("Canvas cleared successfully!");
  },

  setBackgroundColor: (color: string) => {
    const canvas = get().canvas;
    if (canvas) {
      canvas.backgroundColor = color;
      canvas.renderAll();
    }
    set({ backgroundColor: color });
  },
}));
