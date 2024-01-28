import { Spinner } from "./spinner";
import { VDom, cn } from "./ui";

export type ButtonVariant = "contained" | "outlined" | "text";

export type ButtonColor = "primary" | "danger" | "default";

export type ButtonSize = "sm" | "md" | "lg";

type VariantColor = `${ButtonVariant}-${ButtonColor}`;

export type ButtonEvent = {
  stopPropagation: () => void;
};

export const Button = ({
  type,
  start,
  className = "",
  onClick,
  variant = "contained",
  color = "default",
  size = "lg",
  disabled = false,
  loading = false,
  text = "",
}: {
  text?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: (event: ButtonEvent) => void;
  start?: VDom | VDom[];
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  loading?: boolean;
}) => {
  const combo: VariantColor = `${variant}-${color}`;

  return (
    <button
      disabled={disabled || loading}
      type={type}
      className={cn(
        className,
        "relative flex select-none appearance-none flex-nowrap items-center justify-center overflow-hidden font-semibold outline-none focus:ring-2",
        combo === "contained-primary" &&
          "rounded-md bg-blue-600 text-white ring-blue-500",
        combo === "contained-danger" &&
          "rounded-md bg-red-600 text-white ring-red-500",
        combo === "contained-default" &&
          "rounded-md border border-neutral-600 bg-neutral-900 text-blue-500 ring-blue-500",
        combo === "outlined-default" &&
          "rounded-md border border-neutral-800 text-inherit text-neutral-400",

        !disabled && combo === "text-primary" && "text-blue-500",
        size === "lg" && "px-4 py-3 text-xl",
        size === "md" && "px-4 py-2 text-lg",
        size === "sm" && "text-md  px-4 py-1",
        disabled && "cursor-not-allowed bg-neutral-600 opacity-60",
        !disabled && !loading && " active:opacity-70",
        loading && "cursor-wait opacity-70"
      )}
      onClick={(event) => {
        onClick?.({ stopPropagation: () => event.stopPropagation() });
      }}
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-center",
          loading && "text-transparent"
        )}
      >
        {start && <div className="mr-2">{start}</div>}
        {text}
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      )}
    </button>
  );
};
