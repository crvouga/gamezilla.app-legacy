import { IconSpinner } from "./icon";
import { cn } from "./utils";

export const Spinner = (props: { className?: string }) => {
  return (
    <IconSpinner
      className={cn(
        "animate-spin",
        props.className ? props.className : "h-12 w-12"
      )}
    />
  );
};
