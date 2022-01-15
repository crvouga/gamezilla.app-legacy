import React from "react";

export const Button = ({
  onClick,
  className,
  text,
}: {
  className?: string;
  onClick?: () => void;
  text: string;
}) => {
  return (
    <button
      className={`rounded block p-2 text-blue-400 active:text-blue-200 font-bold text-lg ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};
