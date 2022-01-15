import React from "react";

export const PageBar = ({ title }: { title?: string }) => {
  return (
    <div className="w-full p-2 border-b">
      {title && (
        <h1 className="text-xl font-bold flex items-center justify-center flex-1">
          {title}
        </h1>
      )}
    </div>
  );
};
