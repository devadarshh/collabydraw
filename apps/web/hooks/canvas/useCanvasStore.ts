import { create } from "zustand";
import { toast } from "sonner";
import type { Canvas } from "fabric";
import {
  downloadDrawing,
  isValidHexColor,
  parseDrawingFile,
  readDrawingFile,
  serializeDrawing,
} from "@/lib/drawing-io";

interface CanvasState {
  canvas: Canvas | null;
  backgroundColor: string;
  setCanvas: (canvas: Canvas) => void;
  clearCanvas: () => void;
  setBackgroundColor: (color: string) => void;
  exportDrawing: () => void;
  importDrawing: (file: File) => Promise<void>;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  canvas: null,
  backgroundColor: "#ffffff",

  setCanvas: (canvas: Canvas) => set({ canvas }),

  clearCanvas: () => {
    const canvas = get().canvas;
    if (!canvas) return;

    const bgColor = get().backgroundColor;

    canvas.clear();
    canvas.backgroundColor = bgColor;
    canvas.renderAll();

    toast.success("Canvas cleared successfully!");
  },

  setBackgroundColor: (color: string) => {
    if (!isValidHexColor(color)) {
      toast.error("Invalid color. Use a hex value like #ffffff.");
      return;
    }

    const canvas = get().canvas;
    if (canvas) {
      canvas.backgroundColor = color;
      canvas.renderAll();
    }
    set({ backgroundColor: color });
  },

  exportDrawing: () => {
    const { canvas, backgroundColor } = get();
    if (!canvas) {
      toast.error("Canvas is not ready yet.");
      return;
    }

    if (canvas.getObjects().length === 0) {
      toast.error("Nothing to export. Draw something on the canvas first.");
      return;
    }

    try {
      const drawing = serializeDrawing(canvas, backgroundColor);
      downloadDrawing(drawing);
      toast.success("Drawing exported successfully!");
    } catch {
      toast.error("Failed to export drawing. Please try again.");
    }
  },

  importDrawing: async (file: File) => {
    const { canvas } = get();
    if (!canvas) {
      toast.error("Canvas is not ready yet.");
      return;
    }

    try {
      const raw = await readDrawingFile(file);
      const { backgroundColor, canvasJSON } = parseDrawingFile(raw);

      await new Promise<void>((resolve, reject) => {
        canvas.loadFromJSON(canvasJSON, () => {
          try {
            canvas.backgroundColor = backgroundColor;
            canvas.renderAll();
            set({ backgroundColor });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      toast.success("Drawing imported successfully!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to import drawing.";
      toast.error(message);
    }
  },
}));
