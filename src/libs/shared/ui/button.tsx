import { cn } from "./utils";

export type ButtonVariant = "contained" | "outlined" | "text";

export type ButtonColor = "primary" | "danger" | "default";

export type ButtonSize = "sm" | "md" | "lg";

type VariantColor = `${ButtonVariant}-${ButtonColor}`;

export const MyButton = ({
  type,
  children,
  className,
  onClick,
  variant = "contained",
  color = "default",
  size = "md",
  disabled,
}: {
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: (event: { stopPropagation: () => void }) => void;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
}) => {
  const combo: VariantColor = `${variant}-${color}`;

  return (
    <button
      disabled={disabled}
      type={type}
      className={cn(
        className,
        "flex select-none flex-nowrap items-center justify-center gap-2 font-semibold",
        combo === "contained-primary" && "rounded-md bg-blue-500 text-white",
        combo === "contained-danger" && "rounded-md bg-red-500 text-white",
        combo === "contained-default" &&
          "rounded-md border border-neutral-800 bg-neutral-800 text-blue-500",
        combo === "outlined-default" &&
          "rounded-md border border-neutral-700 text-inherit text-neutral-300",
        !disabled && combo === "text-primary" && "text-blue-500",
        size === "lg" && "px-2 py-1.5 text-lg sm:px-4 sm:py-3 sm:text-xl",
        size === "md" && "text-md px-2 py-1 sm:px-4 sm:py-2 sm:text-lg",
        size === "sm" && "sm:text-md px-2 py-0.5 text-sm sm:px-4 sm:py-1",
        disabled && "cursor-not-allowed bg-neutral-600 opacity-50",
        !disabled && " active:opacity-60"
      )}
      onClick={(event) =>
        onClick?.({ stopPropagation: () => event.stopPropagation() })
      }>
      {children}
    </button>
  );
};
