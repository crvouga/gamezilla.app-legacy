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
      className={`overflow-hidden w-full p-2 border-b text-xl font-bold flex items-center ${className}`}
    >
      {left && <div>{left}</div>}
      {center && (
        <div className="flex items-center justify-center flex-1">{center}</div>
      )}
      {right && <div>{right}</div>}
    </div>
  );
};
