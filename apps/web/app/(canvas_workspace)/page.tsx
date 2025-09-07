import CanvasBoard from "./_components/CanvasBoard";

const Page = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex-1">
        <CanvasBoard />
      </div>
    </div>
  );
};

export default Page;
