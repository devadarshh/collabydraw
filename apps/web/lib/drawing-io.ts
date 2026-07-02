import type { Canvas } from "fabric";

export const DRAWING_FILE_VERSION = "1.0";
export const DRAWING_FILE_EXTENSION = ".collabydraw.json";

export interface CollabYDrawFile {
  version: string;
  app: "collabydraw";
  exportedAt: string;
  backgroundColor: string;
  canvas: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidHexColor(color: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color);
}

export function serializeDrawing(
  canvas: Canvas,
  backgroundColor: string
): CollabYDrawFile {
  return {
    version: DRAWING_FILE_VERSION,
    app: "collabydraw",
    exportedAt: new Date().toISOString(),
    backgroundColor,
    canvas: canvas.toJSON() as Record<string, unknown>,
  };
}

export function parseDrawingFile(raw: string): {
  backgroundColor: string;
  canvasJSON: Record<string, unknown>;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON file. Please select a valid drawing export.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Invalid drawing file format.");
  }

  if (parsed.app === "collabydraw" && isRecord(parsed.canvas)) {
    const backgroundColor =
      typeof parsed.backgroundColor === "string"
        ? parsed.backgroundColor
        : typeof parsed.canvas.background === "string"
          ? parsed.canvas.background
          : "#ffffff";

    return { backgroundColor, canvasJSON: parsed.canvas };
  }

  if (Array.isArray(parsed.objects)) {
    const backgroundColor =
      typeof parsed.background === "string" ? parsed.background : "#ffffff";
    return { backgroundColor, canvasJSON: parsed };
  }

  throw new Error(
    "Unrecognized file format. Export a drawing from CollabYDraw or use a Fabric.js canvas JSON file."
  );
}

export function downloadDrawing(
  drawing: CollabYDrawFile,
  filename?: string
): void {
  const defaultName = `collabydraw-${new Date().toISOString().slice(0, 10)}${DRAWING_FILE_EXTENSION}`;
  const blob = new Blob([JSON.stringify(drawing, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename ?? defaultName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function readDrawingFile(file: File): Promise<string> {
  if (!file.name.endsWith(".json") && file.type !== "application/json") {
    throw new Error("Please select a .json drawing file.");
  }

  const maxSizeBytes = 10 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error("File is too large. Maximum supported size is 10 MB.");
  }

  return file.text();
}
