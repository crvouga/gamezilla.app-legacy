import React from "react";

export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="m-auto w-full max-w-xl flex flex-col justify-center items-center">
      {children}
    </div>
  );
};
