import React from "react";

type ZoomControlProps = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
};

export const ZoomControl: React.FC<ZoomControlProps> = ({
  zoomIn,
  zoomOut,
  resetZoom,
}) => {
  return (
    <div className="absolute bottom-4 right-4 flex gap-2 z-10">
      <button
        onClick={zoomIn}
        className="px-3 py-1 bg-indigo-500 text-white rounded"
      >
        +
      </button>
      <button
        onClick={zoomOut}
        className="px-3 py-1 bg-indigo-500 text-white rounded"
      >
        -
      </button>
      <button
        onClick={resetZoom}
        className="px-3 py-1 bg-gray-500 text-white rounded"
      >
        Reset
      </button>
    </div>
  );
};
