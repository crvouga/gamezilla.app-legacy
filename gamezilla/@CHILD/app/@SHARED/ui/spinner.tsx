import { IconSpinner } from "./icon";
import { cn } from "./utils";

export const Spinner = (props: { class?: string }) => {
  return (
    <IconSpinner
      aria-label="Loading..."
      class={cn("animate-spin", props.class ? props.class : "h-12 w-12")}
    />
  );
};
