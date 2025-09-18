import {
  MousePointer2,
  Square,
  Circle,
  Minus,
  Type,
  Pen,
  Eraser,
  Hand,
  ArrowRight,
  Triangle,
} from "lucide-react";

export type ShapeType =
  | "select"
  | "rectangle"
  | "ellipse"
  | "triangle"
  | "line"
  | "freeDraw"
  | "arrow"
  | "text"
  | "eraser"
  | "grab";

interface Tool {
  id: ShapeType;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  shortcut: string;
  description: string;
}

export const tools: Tool[] = [
  {
    id: "select",
    name: "Select",
    icon: MousePointer2,
    shortcut: "1",
    description: "Select (1)",
  },
  {
    id: "rectangle",
    name: "Rectangle",
    icon: Square,
    shortcut: "2",
    description: "Rectangle (2)",
  },
  {
    id: "ellipse",
    name: "Ellipse",
    icon: Circle,
    shortcut: "3",
    description: "Ellipse (3)",
  },
  {
    id: "triangle",
    name: "triangle",
    icon: Triangle,
    shortcut: "4",
    description: "Triangle (4)",
  },
  {
    id: "line",
    name: "Line",
    icon: Minus,
    shortcut: "5",
    description: "Line (5)",
  },
  {
    id: "freeDraw",
    name: "Free Draw",
    icon: Pen,
    shortcut: "6",
    description: "Free Draw (6)",
  },
  {
    id: "arrow",
    name: "Arrow",
    icon: ArrowRight,
    shortcut: "7",
    description: "Arrow (7)",
  },
  {
    id: "text",
    name: "Text",
    icon: Type,
    shortcut: "8",
    description: "Text (8)",
  },
  {
    id: "eraser",
    name: "Eraser",
    icon: Eraser,
    shortcut: "9",
    description: "Eraser (9)",
  },
  {
    id: "grab",
    name: "Grab",
    icon: Hand,
    shortcut: "0",
    description: "Grab (0)",
  },
];
