import CanvasBoard from "@/components/canvas/CanvasBoard";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";

const CanvasPage = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex-1">
        <CanvasBoard />
        <WelcomeOverlay />
      </div>
    </div>
  );
};

export default CanvasPage;
