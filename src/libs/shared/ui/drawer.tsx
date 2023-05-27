import { useEffect } from "react";
import { ViewNode } from "./ui";
import { cn } from "./utils";

export const MyDrawer = ({
  open,
  children,
  onClose,
}: {
  onClose?: () => void;
  open?: boolean;
  children?: ViewNode;
}) => {
  useEscapeKey(onClose);

  if (!open) {
    return null;
  }
  return (
    <div className="absolute top-0 bg-black/60 left-0 w-full h-full flex flex-col justify-end items-end z-40">
      <div
        className={cn(
          "flex-1 w-full transition-opacity duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={onClose}></div>
      <div
        className={cn(
          "border border-neutral-600 bg-black w-full h-auto",

          open ? "translate-x-0" : "-translate-x-full"
        )}>
        {children}
      </div>
    </div>
  );
};

const useEscapeKey = (onEscape?: () => void) => {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape?.();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);
};
