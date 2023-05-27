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
  onClick?: () => void;
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
        "font-semibold flex items-center justify-center gap-2 select-none flex-nowrap",
        combo === "contained-primary" && "bg-blue-500 text-white rounded-md",
        combo === "contained-danger" && "bg-red-500 text-white rounded-md",
        combo === "contained-default" &&
          "bg-neutral-800 border border-neutral-800 text-blue-500 rounded-md",
        combo === "outlined-default" &&
          "border border-neutral-700 text-neutral-300 text-inherit rounded-md",
        !disabled && combo === "text-primary" && "text-blue-500",
        size === "lg" && "text-xl py-3 px-4",
        size === "md" && "text-lg py-2 px-4",
        size === "sm" && "text-md py-1 px-4",
        disabled && "opacity-50 cursor-not-allowed bg-neutral-600",
        !disabled && " active:opacity-60"
      )}
      onClick={onClick}>
      {children}
    </button>
  );
};
