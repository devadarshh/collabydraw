import CanvasBoard from "@/components/canvas/CanvasBoard";

const CanvasPage = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex-1">
        <CanvasBoard />
      </div>
    </div>
  );
};

export default CanvasPage;
