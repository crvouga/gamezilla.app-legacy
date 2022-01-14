import React from "react";

export const ItemStart = ({ children }: { children: React.ReactNode }) => {
  return <div className="mr-4">{children}</div>;
};

export const ItemCenter = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex-1">{children}</div>;
};

export const ItemEnd = ({ children }: { children: React.ReactNode }) => {
  return <div className="">{children}</div>;
};

export const Item = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <div
      className="w-full flex flex-row justify-start items-center font-bold p-4 border-b hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
      {...props}
    >
      {children}
    </div>
  );
};
