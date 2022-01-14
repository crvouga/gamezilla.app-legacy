import React from "react";

export const Button = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <button
      className="w-full p-2 text-blue-400 active:text-blue-200 font-bold font-lg"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
