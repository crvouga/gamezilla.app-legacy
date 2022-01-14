import React from "react";

export const PageBarTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="text-xl font-bold flex items-center justify-center flex-1">
      {children}
    </h1>
  );
};

export const PageBar = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full p-2 border-b">{children}</div>;
};
