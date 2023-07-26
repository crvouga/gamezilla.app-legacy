import { VDom, cn } from "@gamezilla/ui";

export const GameLayout = ({
  children,
  isSpectating,
  className,
}: {
  className?: string;
  isSpectating?: boolean;
  children?: VDom | VDom[];
}) => {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center overflow-y-auto",
        isSpectating && "border-8 border-t-0 border-blue-500",
        className
      )}>
      {isSpectating && (
        <div className="flex w-full items-center justify-center bg-blue-500 py-1 text-sm font-semibold text-white">
          You are spectating
        </div>
      )}
      {children}
    </div>
  );
};
