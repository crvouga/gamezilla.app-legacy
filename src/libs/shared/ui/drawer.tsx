import { useEffect } from "react";
import { VDom } from "./ui";
import { cn } from "./utils";

export const MyDrawer = ({
  open,
  children,
  onClose,
}: {
  onClose?: () => void;
  open?: boolean;
  children?: VDom;
}) => {
  useEscapeKey(onClose);

  if (!open) {
    return null;
  }
  return (
    <div className="absolute left-0 top-0 z-40 flex h-full w-full flex-col items-end justify-end bg-black/60">
      <div
        className={cn(
          "w-full flex-1 transition-opacity duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={onClose}></div>
      <div
        className={cn(
          "h-auto w-full border border-neutral-700 bg-black",
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
