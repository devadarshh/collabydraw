import React from "react";

interface CanvasLayoutProps {
  children: React.ReactNode;
}

const CanvasLayout = ({ children }: CanvasLayoutProps) => {
  return <>{children}</>;
};

export default CanvasLayout;
