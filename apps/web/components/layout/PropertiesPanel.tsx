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
    fontFamily,
    fontSize,
    textAlign,
    strokeStyle,
    setStrokeColor,
    setFillColor,
    setStrokeWidth,
    setOpacity,
    setFontFamily,
    setFontSize,
    setTextAlign,
    setStrokeStyle,
  } = useCanvasProperties();

  const [customStroke, setCustomStroke] = useState(strokeColor);
  const [customFill, setCustomFill] = useState(fillColor);

  const isShapeTool = [
    "rectangle",
    "ellipse",
    "triangle",
    "line",
    "arrow",
    "freeDraw",
  ].includes(selectedTool);
  const isTextTool = selectedTool === "text";

  const transparentBg =
    "repeating-conic-gradient(#e5e5e5 0% 25%, #fafafa 0% 50%)";

  const renderColorButton = (
    color: string,
    currentColor: string,
    onClick: (c: string) => void,
    prefix: string
  ) => (
    <button
      key={`${prefix}-${color}`}
      onClick={() => onClick(color)}
      className={cn(
        "w-full aspect-square rounded border transition-transform hover:scale-105 cursor-pointer",
        currentColor === color
          ? "ring-2 ring-[#605ebc] ring-offset-1"
          : "border-[#605ebc33]"
      )}
      style={{
        background: color === "transparent" ? transparentBg : color,
        backgroundSize: "12px 12px",
      }}
    />
  );

  return (
    <div
      className={cn(
        "flex flex-col w-64 sm:w-72 bg-white dark:bg-[#1e1e1e] text-[#111] dark:text-[#eee] border-l border-[#605ebc33] p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto max-h-[90vh] transition-transform duration-300 ease-in-out",
        className
      )}
    >
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <h2 className="font-semibold capitalize text-[#605ebc] text-sm sm:text-base">
          {selectedTool} Properties
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-[#605ebc] hover:text-[#8d8bd6] cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isShapeTool && (
        <section>
          <h3 className="text-xs font-semibold text-[#605ebc] mb-1">Stroke</h3>
          <div className="grid grid-cols-6 gap-1 mb-2">
            {colorSwatches.map((color) =>
              renderColorButton(
                color,
                strokeColor,
                (c) => {
                  setStrokeColor(c);
                  setCustomStroke(c);
                },
                "stroke"
              )
            )}
            <input
              type="color"
              value={customStroke}
              onChange={(e) => {
                setCustomStroke(e.target.value);
                setStrokeColor(e.target.value);
              }}
              className="w-10 h-10 p-0 rounded border cursor-pointer"
            />
          </div>

          {!isTextTool && (
            <>
              <h4 className="text-[11px] font-semibold text-[#605ebc] mb-1">
                Width
              </h4>
              <div className="flex flex-wrap gap-1">
                {strokeWidths.map((w) => (
                  <button
                    key={w}
                    onClick={() => setStrokeWidth(w)}
                    className={cn(
                      "flex-1 h-7 rounded border text-xs font-medium cursor-pointer",
                      strokeWidth === w
                        ? "bg-[#605ebc] text-white border-[#605ebc]"
                        : "border-[#605ebc33] hover:bg-[#8d8bd622]"
                    )}
                  >
                    {w}px
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {(isShapeTool || isTextTool) &&
        !["line", "freeDraw", "arrow"].includes(selectedTool) && (
          <section>
            <h3 className="text-xs font-semibold text-[#605ebc] mb-1">Fill</h3>
            <div className="grid grid-cols-6 gap-1">
              {colorSwatches.map((color) =>
                renderColorButton(
                  color,
                  fillColor,
                  (c) => {
                    setFillColor(c);
                    setCustomFill(c);
                  },
                  "fill"
                )
              )}
              <input
                type="color"
                value={customFill}
                onChange={(e) => {
                  setCustomFill(e.target.value);
                  setFillColor(e.target.value);
                }}
                className="w-10 h-10 p-0 rounded border cursor-pointer"
              />
            </div>
          </section>
        )}

      {isShapeTool && selectedTool !== "freeDraw" && (
        <section>
          <h4 className="text-[11px] font-semibold text-[#605ebc] mb-1">
            Stroke Style
          </h4>
          <div className="flex gap-1">
            {[
              { key: "solid", dash: "" },
              { key: "dashed", dash: "6,4" },
              { key: "dotted", dash: "2,4" },
            ].map(({ key, dash }) => (
              <button
                key={key}
                onClick={() => setStrokeStyle(key as any)}
                className={cn(
                  "flex-1 h-7 rounded border flex items-center justify-center cursor-pointer",
                  strokeStyle === key
                    ? "bg-[#605ebc] text-white border-[#605ebc]"
                    : "border-[#605ebc33] hover:bg-[#8d8bd622]"
                )}
              >
                <svg width="28" height="12" viewBox="0 0 28 12">
                  <line
                    x1="2"
                    y1="6"
                    x2="26"
                    y2="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={dash}
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            ))}
          </div>
        </section>
      )}

      {isTextTool && (
        <section>
          <h3 className="text-xs font-semibold text-[#605ebc] mb-1">Text</h3>

          {/* <div className="flex gap-1 mb-2">
            {fontFamilies.map((family) => (
              <button
                key={family}
                onClick={() => setFontFamily(family)}
                className={cn(
                  "flex-1 h-7 rounded border text-[11px] font-medium cursor-pointer",
                  fontFamily === family
                    ? "bg-[#605ebc] text-white border-[#605ebc]"
                    : "border-[#605ebc33] hover:bg-[#8d8bd622]"
                )}
              >
                {family}
              </button>
            ))}
          </div> */}

          <div className="flex gap-1 mb-2">
            {fontSizes.map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={cn(
                  "flex-1 h-7 rounded border text-[11px] font-medium cursor-pointer",
                  fontSize === size
                    ? "bg-[#605ebc] text-white border-[#605ebc]"
                    : "border-[#605ebc33] hover:bg-[#8d8bd622]"
                )}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            {textAlignments.map((align) => (
              <button
                key={align}
                onClick={() => setTextAlign(align)}
                className={cn(
                  "flex-1 h-7 rounded border flex items-center justify-center cursor-pointer",
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

      {(isShapeTool || isTextTool) &&
        !["line", "freeDraw"].includes(selectedTool) && (
          <section>
            <h3 className="font-semibold text-gray-400 mb-1 text-[11px]">
              Style
            </h3>
            <label className="flex justify-between text-[11px] mb-1">
              <span>Opacity</span>
              <span>{opacity}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full h-1.5 accent-[#605ebc] bg-gray-200 dark:bg-gray-700 rounded cursor-pointer mb-2"
            />
          </section>
        )}
    </div>
  );
}
