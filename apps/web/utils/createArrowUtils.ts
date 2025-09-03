import * as fabric from "fabric";

export const createArrow = (x1: number, y1: number, x2: number, y2: number) => {
  const line = new fabric.Line([x1, y1, x2, y2], {
    stroke: "blue",
    strokeWidth: 3,
    selectable: false,
    evented: false,
  });

  const head = new fabric.Triangle({
    left: x2,
    top: y2,
    originX: "center",
    originY: "center",
    width: 15,
    height: 20,
    fill: "blue",
    angle: (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + 90,
    selectable: false,
    evented: false,
  });

  const group = new fabric.Group([line, head], {
    selectable: false,
    evented: false,
  }) as fabric.Group & { line: fabric.Line; head: fabric.Triangle };

  group.line = line;
  group.head = head;

  return group;
};
