import React from "react";

export const Backdrop = ({
  children,
  onClick,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div
      onClick={onClick}
      className="fixed top-0 left-0 bottom-0 right-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.54)" }}
    >
      {children}
    </div>
  );
};
