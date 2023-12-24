import { IconSpinner } from "./icon";
import { cn } from "./utils";

export const Spinner = (props: { className?: string }) => {
  return (
    <IconSpinner
      aria-label="Loading..."
      className={cn("animate-spin", props.className ? props.className : "h-12 w-12")}
    />
  );
};
