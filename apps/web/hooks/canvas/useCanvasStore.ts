import { create } from "zustand";
import * as fabric from "fabric";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface CanvasState {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas) => void;
  clearCanvas: () => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void; // 🔥 new
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  canvas: null,

  setCanvas: (canvas) => set({ canvas }),

  clearCanvas: () => {
    const canvas = get().canvas;
    if (!canvas) return;

    // get theme from <html data-theme> (set by next-themes)
    const isDark =
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark");

    const bgColor = isDark ? "#121212" : "#ffffff";

    canvas.clear();
    canvas.backgroundColor = bgColor;
    canvas.renderAll();

    toast.success("Canvas cleared successfully!");
  },
  backgroundColor: "#ffffff",
  setBackgroundColor: (color: string) => {
    const canvas = get().canvas;
    if (canvas) {
      canvas.backgroundColor = color;
      canvas.renderAll();
    }
    set({ backgroundColor: color });
  },
}));
