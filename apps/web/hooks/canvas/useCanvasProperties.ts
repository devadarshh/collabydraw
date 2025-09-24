import { create } from "zustand";

type StrokeStyle = "solid" | "dashed" | "dotted";

interface CanvasProperties {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  fontFamily: string;
  fontSize: number;
  textAlign: "left" | "center" | "right";
  strokeStyle: StrokeStyle;
  textColor: string;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (w: number) => void;
  setOpacity: (o: number) => void;
  setFontFamily: (f: string) => void;
  setFontSize: (s: number) => void;
  setTextAlign: (a: "left" | "center" | "right") => void;
  setStrokeStyle: (s: StrokeStyle) => void;
  setTextColor: (color: string) => void;
}

export const useCanvasProperties = create<CanvasProperties>((set) => ({
  strokeColor: "#000000",
  fillColor: "#ffffff",
  strokeWidth: 2,
  opacity: 100,
  fontFamily: "Assistant",
  fontSize: 36,
  textAlign: "left",
  strokeStyle: "solid",
  textColor: "#000000",
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setFillColor: (fillColor) => set({ fillColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setOpacity: (opacity) => set({ opacity }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontSize: (fontSize) => set({ fontSize }),
  setTextAlign: (textAlign) => set({ textAlign }),
  setStrokeStyle: (strokeStyle) => set({ strokeStyle }),
  setTextColor: (color: string) => set({ textColor: color }),
}));
