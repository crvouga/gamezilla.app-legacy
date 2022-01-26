import React from "react";

export const Item = ({
  start,
  center,
  end,
  onClick,
}: {
  onClick?: () => void;
  start?: React.ReactNode;
  center?: React.ReactNode;
  end?: React.ReactNode;
}) => {
  return (
    <div
      className="text-gray-700 w-full flex flex-row justify-start items-center font-bold p-4 border-b hover:opacity-75 active:opacity-50 cursor-pointer"
      onClick={onClick}
    >
      {start && <div className="mr-4">{start}</div>}
      {center && <div className="flex-1">{center}</div>}
      {end && <div>{end}</div>}
    </div>
  );
};
