import React from "react";

export const Surface = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`p-4 drop-shadow-md rounded-md bg bg-slate-100 ${className}`}
    >
      {children}
    </div>
  );
};
