import { VDomChildren } from "gamezilla-app/@shared/vdom"
import { Spinner } from "./spinner"
import { cn } from "./ui"

export type ButtonVariant = "contained" | "outlined" | "text" | "soft"

export type ButtonColor = "primary" | "danger" | "default"

export type ButtonSize = "sm" | "md" | "lg"

type VariantColor = `${ButtonVariant}-${ButtonColor}`

export type ButtonEvent = {
  stopPropagation: () => void
}

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
  text?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  className?: string
  onClick?: (msgEvt: ButtonEvent) => void
  start?: VDomChildren
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
  loading?: boolean
}) => {
  const combo: VariantColor = `${variant}-${color}`

  return (
    <button
      disabled={disabled || loading}
      type={type}
      className={cn(
        className,
        "relative flex shrink-0 select-none appearance-none flex-nowrap items-center justify-center overflow-hidden font-semibold outline-none focus:ring-2",

        combo === "contained-primary" &&
          "rounded-md bg-blue-600 text-white ring-blue-500",

        combo === "contained-danger" &&
          "rounded-md bg-red-600 text-white ring-red-500",

        combo === "contained-default" &&
          "rounded-md border-2 border-blue-500/40  text-blue-500 ring-blue-500",

        combo === "outlined-default" &&
          "rounded-md border border-neutral-700 text-inherit text-neutral-300",

        combo === "soft-primary" && "rounded-md bg-blue-500/20 text-blue-200",

        !disabled && combo === "text-primary" && "text-blue-500",
        size === "lg" && "px-4 py-3 text-xl",
        size === "md" && "px-4 py-2 text-lg",
        size === "sm" && "text-md  px-4 py-1",
        disabled && "cursor-not-allowed opacity-60",
        !disabled && !loading && " active:opacity-70",
        loading && "cursor-wait opacity-70",
      )}
      onClick={(msgEvt) => {
        onClick?.({ stopPropagation: () => msgEvt.stopPropagation() })
      }}
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-center",
          loading && "text-transparent",
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
  )
}
