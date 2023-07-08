import { cn } from "./utils";

export type ButtonVariant = "contained" | "outlined" | "text";

export type ButtonColor = "primary" | "danger" | "default";

export type ButtonSize = "sm" | "md" | "lg";

type VariantColor = `${ButtonVariant}-${ButtonColor}`;

export type ButtonEvent = {
  stopPropagation: () => void;
};

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
  onClick?: (event: ButtonEvent) => void;
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
          "rounded-md border border-neutral-800 text-inherit text-neutral-300",
        !disabled && combo === "text-primary" && "text-blue-500",
        size === "lg" && "px-4 py-3 text-xl",
        size === "md" && "px-4 py-2 text-lg",
        size === "sm" && "text-md  px-4 py-1",
        disabled && "cursor-not-allowed bg-neutral-600 opacity-60",
        !disabled && " active:opacity-70"
      )}
      onClick={(event) => {
        onClick?.({ stopPropagation: () => event.stopPropagation() });
      }}>
      {children}
    </button>
  );
};
