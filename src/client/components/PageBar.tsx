import React from "react";

export const PageBar = ({
  left,
  center,
  right,
  className,
}: {
  className?: string;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}) => {
  return (
    <div
      className={`overflow-hidden w-full border-b text-xl font-bold flex items-center ${className}`}
    >
      {left && <div className="ml-2">{left}</div>}
      {center && (
        <div className="p-2 flex items-center justify-center flex-1">
          {center}
        </div>
      )}
      {right && <div className="mr-2">{right}</div>}
    </div>
  );
};
