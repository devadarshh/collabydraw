import { useState } from "react";
import {
  Palette,
  Square,
  Circle,
  Minus,
  Type,
  Sliders,
  MoreHorizontal,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertiesPanelProps {
  selectedTool: string;
  onClose?: () => void;
  className?: string;
}

interface ColorSwatch {
  name: string;
  value: string;
}

const colorSwatches: ColorSwatch[] = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#ffffff" },
  { name: "Red", value: "#e53e3e" },
  { name: "Blue", value: "#3182ce" },
  { name: "Green", value: "#38a169" },
  { name: "Yellow", value: "#d69e2e" },
  { name: "Purple", value: "#805ad5" },
  { name: "Pink", value: "#d53f8c" },
  { name: "Orange", value: "#dd6b20" },
  { name: "Teal", value: "#319795" },
  { name: "Gray", value: "#718096" },
  { name: "Transparent", value: "transparent" },
];

const strokeWidths = [1, 2, 3, 4, 5, 8];
const opacityLevels = [25, 50, 75, 100];
const roughnessLevels = [0, 1, 2];

export function PropertiesPanel({
  selectedTool,
  onClose,
  className,
}: PropertiesPanelProps) {
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(100);
  const [roughness, setRoughness] = useState(1);
  const [showColorPicker, setShowColorPicker] = useState<
    "stroke" | "fill" | null
  >(null);

  const isShapeTool = [
    "rectangle",
    "ellipse",
    "triangle",
    "diamond",
    "hexagon",
    "star",
    "arrow",
    "line",
  ].includes(selectedTool);
  const isTextTool = selectedTool === "text";
  const isDrawTool = selectedTool === "pen";

  if (!isShapeTool && !isTextTool && !isDrawTool) {
    return null;
  }

  const ColorButton = ({
    color,
    isActive,
    onClick,
    type,
  }: {
    color: string;
    isActive: boolean;
    onClick: () => void;
    type: "stroke" | "fill";
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center w-8 h-8 rounded-md border-2 transition-all duration-150",
        "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
        isActive ? "border-foreground shadow-md" : "border-border",
        color === "transparent" &&
          "bg-[url('data:image/svg+xml,%3csvg%20width%3d%27100%25%27%20height%3d%27100%25%27%20xmlns%3d%27http%3a//www.w3.org/2000/svg%27%3e%3cdefs%3e%3cpattern%20id%3d%27a%27%20patternUnits%3d%27userSpaceOnUse%27%20width%3d%278%27%20height%3d%278%27%3e%3cpath%20d%3d%27m0%200h4v4h-4zm4%204h4v4h-4z%27%20fill%3d%27%23f1f5f9%27/%3e%3c/pattern%3e%3c/defs%3e%3crect%20width%3d%27100%25%27%20height%3d%27100%25%27%20fill%3d%27url%28%23a%29%27/%3e%3c/svg%3e')]"
      )}
      style={{ backgroundColor: color === "transparent" ? undefined : color }}
      title={`${type} color: ${color}`}
    >
      {type === "fill" && color === "transparent" && (
        <Minus className="w-3 h-3 text-muted-foreground rotate-45" />
      )}
    </button>
  );

  const StrokeWidthButton = ({
    width,
    isActive,
    onClick,
  }: {
    width: number;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-md border transition-all duration-150",
        "hover:bg-tool-bg-hover focus:outline-none focus:ring-2 focus:ring-ring",
        isActive
          ? "bg-tool-bg-active border-primary"
          : "bg-tool-bg border-border hover:border-muted-foreground"
      )}
      title={`Stroke width: ${width}px`}
    >
      <div
        className="rounded-full bg-foreground"
        style={{ width: Math.max(2, width), height: Math.max(2, width) }}
      />
    </button>
  );

  const PropertyButton = ({
    label,
    value,
    onClick,
    suffix = "",
  }: {
    label: string;
    value: number;
    onClick: () => void;
    suffix?: string;
  }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-tool-bg hover:bg-tool-bg-hover border border-border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      title={`${label}: ${value}${suffix}`}
    >
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground">
        {value}
        {suffix}
      </span>
      <ChevronDown className="w-3 h-3 text-muted-foreground" />
    </button>
  );

  const ColorPickerDropdown = ({
    type,
    currentColor,
    onColorChange,
  }: {
    type: "stroke" | "fill";
    currentColor: string;
    onColorChange: (color: string) => void;
  }) => (
    <div className="absolute top-full left-0 mt-2 p-3 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[240px]">
      <div className="mb-3">
        <label className="text-xs font-medium text-muted-foreground block mb-2">
          Color Code
        </label>
        <input
          type="text"
          value={currentColor}
          onChange={(e) => onColorChange(e.target.value)}
          placeholder="#000000"
          className="w-full px-2 py-1 text-xs bg-tool-bg border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div className="grid grid-cols-6 gap-1">
        {colorSwatches.map((color) => (
          <button
            key={color.value}
            onClick={() => onColorChange(color.value)}
            className={cn(
              "w-6 h-6 rounded border transition-all duration-150",
              "hover:scale-110 focus:outline-none focus:ring-1 focus:ring-ring",
              currentColor === color.value
                ? "border-foreground ring-1 ring-ring"
                : "border-border",
              color.value === "transparent" &&
                "bg-[url('data:image/svg+xml,%3csvg%20width%3d%27100%25%27%20height%3d%27100%25%27%20xmlns%3d%27http%3a//www.w3.org/2000/svg%27%3e%3cdefs%3e%3cpattern%20id%3d%27a%27%20patternUnits%3d%27userSpaceOnUse%27%20width%3d%278%27%20height%3d%278%27%3e%3cpath%20d%3d%27m0%200h4v4h-4zm4%204h4v4h-4z%27%20fill%3d%27%23f1f5f9%27/%3e%3c/pattern%3e%3c/defs%3e%3crect%20width%3d%27100%25%27%20height%3d%27100%25%27%20fill%3d%27url%28%23a%29%27/%3e%3c/svg%3e')]"
            )}
            style={{
              backgroundColor:
                color.value === "transparent" ? undefined : color.value,
            }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Floating Properties Panel */}
      <div
        className={cn(
          "fixed top-16 left-1/2 transform -translate-x-1/2 z-50",
          "bg-popover border border-border rounded-lg shadow-lg",
          "p-3 min-w-[320px] max-w-[90vw]",
          "animate-fade-in",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground capitalize">
              {selectedTool}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-tool-bg-hover rounded transition-colors"
              title="Close properties"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Properties Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Stroke Color */}
          {(isShapeTool || isDrawTool || isTextTool) && (
            <div className="relative">
              <ColorButton
                color={strokeColor}
                isActive={showColorPicker === "stroke"}
                onClick={() =>
                  setShowColorPicker(
                    showColorPicker === "stroke" ? null : "stroke"
                  )
                }
                type="stroke"
              />
              {showColorPicker === "stroke" && (
                <ColorPickerDropdown
                  type="stroke"
                  currentColor={strokeColor}
                  onColorChange={(color) => {
                    setStrokeColor(color);
                    setShowColorPicker(null);
                  }}
                />
              )}
            </div>
          )}

          {/* Fill Color */}
          {isShapeTool && (
            <div className="relative">
              <ColorButton
                color={fillColor}
                isActive={showColorPicker === "fill"}
                onClick={() =>
                  setShowColorPicker(showColorPicker === "fill" ? null : "fill")
                }
                type="fill"
              />
              {showColorPicker === "fill" && (
                <ColorPickerDropdown
                  type="fill"
                  currentColor={fillColor}
                  onColorChange={(color) => {
                    setFillColor(color);
                    setShowColorPicker(null);
                  }}
                />
              )}
            </div>
          )}

          {/* Stroke Width */}
          {(isShapeTool || isDrawTool) && (
            <div className="flex items-center gap-1">
              {strokeWidths.map((width) => (
                <StrokeWidthButton
                  key={width}
                  width={width}
                  isActive={strokeWidth === width}
                  onClick={() => setStrokeWidth(width)}
                />
              ))}
            </div>
          )}

          {/* Divider */}
          {(isShapeTool || isDrawTool) && (
            <div className="w-px h-6 bg-border" />
          )}

          {/* Opacity */}
          <PropertyButton
            label="Opacity"
            value={opacity}
            onClick={() => {
              const nextIndex =
                (opacityLevels.indexOf(opacity) + 1) % opacityLevels.length;
              setOpacity(opacityLevels[nextIndex] as any);
            }}
            suffix="%"
          />

          {/* Roughness for shapes */}
          {isShapeTool && (
            <PropertyButton
              label="Roughness"
              value={roughness}
              onClick={() => {
                const nextIndex =
                  (roughnessLevels.indexOf(roughness) + 1) %
                  roughnessLevels.length;
                setRoughness(roughnessLevels[nextIndex] as any);
              }}
            />
          )}
        </div>

        {/* Click outside to close color picker */}
        {showColorPicker && (
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setShowColorPicker(null)}
          />
        )}
      </div>
    </>
  );
}
