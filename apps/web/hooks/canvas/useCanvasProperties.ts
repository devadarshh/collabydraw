import { create } from "zustand";

type StrokeStyle = "solid" | "dashed" | "dotted";

interface CanvasProperties {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  roughness: number;
  fontFamily: string;
  fontSize: number;
  textAlign: "left" | "center" | "right";
  strokeStyle: StrokeStyle; // 🔥 NEW
  textColor: string; // ✅ new
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (w: number) => void;
  setOpacity: (o: number) => void;
  setRoughness: (r: number) => void;
  setFontFamily: (f: string) => void;
  setFontSize: (s: number) => void;
  setTextAlign: (a: "left" | "center" | "right") => void;
  setStrokeStyle: (s: StrokeStyle) => void; // 🔥 NEW
  setTextColor: (color: string) => void; // ✅ new
}

export const useCanvasProperties = create<CanvasProperties>((set) => ({
  strokeColor: "#000000",
  fillColor: "#ffffff",
  strokeWidth: 2,
  opacity: 100,
  roughness: 0,
  fontFamily: "Assistant",
  fontSize: 18,
  textAlign: "left",
  strokeStyle: "solid", // 🔥 default
  textColor: "#000000",
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setFillColor: (fillColor) => set({ fillColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setOpacity: (opacity) => set({ opacity }),
  setRoughness: (roughness) => set({ roughness }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontSize: (fontSize) => set({ fontSize }),
  setTextAlign: (textAlign) => set({ textAlign }),
  setStrokeStyle: (strokeStyle) => set({ strokeStyle }),
  setTextColor: (color: string) => set({ textColor: color }),
}));
