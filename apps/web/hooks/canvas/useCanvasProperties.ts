import { create } from "zustand";

interface CanvasPropertiesState {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  roughness: number;
  fontFamily: string;
  fontSize: number;
  textAlign: "left" | "center" | "right";
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setOpacity: (value: number) => void;
  setRoughness: (value: number) => void;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  setTextAlign: (align: "left" | "center" | "right") => void;
}

export const useCanvasProperties = create<CanvasPropertiesState>((set) => ({
  strokeColor: "#000000",
  fillColor: "transparent",
  strokeWidth: 2,
  opacity: 100,
  roughness: 1,
  fontFamily: "Inter",
  fontSize: 16,
  textAlign: "left",
  setStrokeColor: (color) => set({ strokeColor: color }),
  setFillColor: (color) => set({ fillColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setOpacity: (value) => set({ opacity: value }),
  setRoughness: (value) => set({ roughness: value }),
  setFontFamily: (font) => set({ fontFamily: font }),
  setFontSize: (size) => set({ fontSize: size }),
  setTextAlign: (align) => set({ textAlign: align }),
}));
