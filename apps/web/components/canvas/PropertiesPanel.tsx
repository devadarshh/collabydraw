"use client";

import { useState } from "react";
import { X, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanvasProperties } from "@/hooks/canvas/useCanvasProperties";

interface PropertiesPanelProps {
  selectedTool: string;
  onClose?: () => void;
  className?: string;
}

// --- Data ---
const colorSwatches = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#14b8a6",
  "#64748b",
  "transparent",
];
const strokeWidths = [1, 2, 3, 4, 5, 8];
const fontFamilies = ["Inter", "Serif", "Mono"] as const;
const fontSizes = [12, 16, 24, 36];
const textAlignments = ["left", "center", "right"] as const;

export function PropertiesPanel({
  selectedTool,
  onClose,
  className,
}: PropertiesPanelProps) {
  const {
    strokeColor,
    fillColor,
    strokeWidth,
    opacity,
    roughness,
    fontFamily,
    fontSize,
    textAlign,
    setStrokeColor,
    setFillColor,
    setStrokeWidth,
    setOpacity,
    setRoughness,
    setFontFamily,
    setFontSize,
    setTextAlign,
  } = useCanvasProperties();

  console.log(strokeColor);

  const isShapeTool = [
    "rectangle",
    "ellipse",
    "diamond",
    "line",
    "arrow",
    "freeDraw", // included here
  ].includes(selectedTool);

  const isTextTool = selectedTool === "text";

  const transparentBg =
    "repeating-conic-gradient(#e5e5e5 0% 25%, #fafafa 0% 50%)";

  return (
    <div
      className={cn(
        "flex flex-col w-64 sm:w-72 h-screen",
        "bg-white dark:bg-[#1e1e1e] text-[#111] dark:text-[#eee]",
        "border-l border-[#605ebc33] p-5 overflow-y-auto space-y-6",
        "transition-transform duration-300 ease-in-out",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold capitalize text-[#605ebc] text-sm">
          {selectedTool} Properties
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-[#605ebc] hover:text-[#8d8bd6]"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Stroke Section */}
      {(isShapeTool || isTextTool) && (
        <section>
          <h3 className="text-xs font-semibold text-[#605ebc] mb-2">Stroke</h3>
          <div className="grid grid-cols-6 gap-1 mb-3">
            {colorSwatches.map((color) => (
              <button
                key={`stroke-${color}`}
                onClick={() => setStrokeColor(color)}
                className={cn(
                  "w-full aspect-square rounded border transition-transform hover:scale-105",
                  strokeColor === color
                    ? "ring-2 ring-[#605ebc] ring-offset-1"
                    : "border-[#605ebc33]"
                )}
                style={{
                  background: color === "transparent" ? transparentBg : color,
                  backgroundSize: "12px 12px",
                }}
              />
            ))}
          </div>
          <h4 className="text-[11px] font-semibold text-[#605ebc] mb-1">
            Width
          </h4>
          <div className="flex flex-wrap gap-1">
            {strokeWidths.map((w) => (
              <button
                key={w}
                onClick={() => setStrokeWidth(w)}
                className={cn(
                  "flex-1 h-7 rounded border text-xs font-medium",
                  strokeWidth === w
                    ? "bg-[#605ebc] text-white border-[#605ebc]"
                    : "border-[#605ebc33] hover:bg-[#8d8bd622]"
                )}
              >
                {w}px
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Fill Section */}
      {(isShapeTool || isTextTool) && (
        <section>
          <h3 className="text-xs font-semibold text-[#605ebc] mb-2">Fill</h3>
          {
            <div className="grid grid-cols-6 gap-1">
              {colorSwatches.map((color) => (
                <button
                  key={`fill-${color}`}
                  onClick={() => setFillColor(color)}
                  className={cn(
                    "w-full aspect-square rounded border transition-transform hover:scale-105",
                    fillColor === color
                      ? "ring-2 ring-[#605ebc] ring-offset-1"
                      : "border-[#605ebc33]"
                  )}
                  style={{
                    background: color === "transparent" ? transparentBg : color,
                    backgroundSize: "12px 12px",
                  }}
                />
              ))}
            </div>
          }
        </section>
      )}

      {/* Text Section */}
      {isTextTool && (
        <section>
          <h3 className="text-xs font-semibold text-[#605ebc] mb-2">Text</h3>
          {/* Fonts */}
          <div className="flex gap-1 mb-2">
            {fontFamilies.map((family) => (
              <button
                key={family}
                onClick={() => setFontFamily(family)}
                className={cn(
                  "flex-1 h-7 rounded border text-[11px] font-medium",
                  fontFamily === family
                    ? "bg-[#605ebc] text-white border-[#605ebc]"
                    : "border-[#605ebc33] hover:bg-[#8d8bd622]"
                )}
              >
                {family}
              </button>
            ))}
          </div>
          {/* Sizes */}
          <div className="flex gap-1 mb-2">
            {fontSizes.map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={cn(
                  "flex-1 h-7 rounded border text-[11px] font-medium",
                  fontSize === size
                    ? "bg-[#605ebc] text-white border-[#605ebc]"
                    : "border-[#605ebc33] hover:bg-[#8d8bd622]"
                )}
              >
                {size}
              </button>
            ))}
          </div>
          {/* Alignment */}
          <div className="flex gap-1">
            {textAlignments.map((align) => (
              <button
                key={align}
                onClick={() => setTextAlign(align)}
                className={cn(
                  "flex-1 h-7 rounded border flex items-center justify-center",
                  textAlign === align
                    ? "bg-[#605ebc] text-white border-[#605ebc]"
                    : "border-[#605ebc33] hover:bg-[#8d8bd622]"
                )}
              >
                {align === "left" && <AlignLeft size={14} />}
                {align === "center" && <AlignCenter size={14} />}
                {align === "right" && <AlignRight size={14} />}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Style Section */}
      {(isShapeTool || isTextTool) && (
        <section>
          <h3 className="font-semibold text-gray-400 mb-2 text-[11px]">
            Style
          </h3>

          {/* Opacity */}
          <label className="flex justify-between text-[11px] mb-1">
            <span>Opacity</span>
            <span>{opacity}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full h-1.5 accent-[#605ebc] bg-gray-200 dark:bg-gray-700 rounded cursor-pointer mb-4"
          />

          {/* Roughness (all shapes, including freeDraw) */}
          {isShapeTool && (
            <>
              <label className="flex justify-between text-[11px] mb-1">
                <span>Roughness</span>
                <span>{roughness}</span>
              </label>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={roughness}
                onChange={(e) => setRoughness(Number(e.target.value))}
                className="w-full h-1.5 accent-[#605ebc] bg-gray-200 dark:bg-gray-700 rounded cursor-pointer"
              />
            </>
          )}
        </section>
      )}
    </div>
  );
}
