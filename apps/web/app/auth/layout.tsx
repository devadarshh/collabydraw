import React from "react";

const Authlayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/authBgImage.png')" }} 
    >
      {children}
    </div>
  );
};

export default Authlayout;
