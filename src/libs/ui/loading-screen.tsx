import { cn } from "./utils";
import { IconSpinner } from "./icon";

export const LoadingScreen = ({
  absolute,
}: {
  absolute?: boolean;
  title?: string;
}) => {
  return (
    <div
      id="loading-screen"
      key="loading-screen"
      className={cn(
        "flex flex-col items-center justify-center",
        absolute && "absolute inset-0",
        !absolute && "h-screen"
      )}>
      <IconSpinner
        key="loading-screen-spinner"
        className="h-12 w-12 animate-spin"
      />
    </div>
  );
};
