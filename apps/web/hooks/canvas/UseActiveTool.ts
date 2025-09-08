// store/useToolStore.ts
import { ShapeType } from "@/types/tools";
import { create } from "zustand";

interface ToolState {
  activeTool: ShapeType;
  setActiveTool: (tool: ShapeType) => void;
  resetTool: () => void;
}

export const useActiveToolStore = create<ToolState>((set) => ({
  activeTool: "select",
  setActiveTool: (tool) => set({ activeTool: tool }),
  resetTool: () => set({ activeTool: "select" }),
}));
