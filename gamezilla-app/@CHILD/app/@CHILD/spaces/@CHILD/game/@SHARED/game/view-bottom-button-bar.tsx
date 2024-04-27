import { Spinner, cn } from "gamezilla-app/@CHILD/app/@SHARED/ui"
import { VDom, VDomChildren } from "gamezilla-app/@SHARED/vdom"

type BottomBarButtonAction = {
  label: string
  disabled?: boolean
  icon: (props: { className: string }) => VDom
  classNames?: {
    button?: string
    label?: string
  }
  onClick: () => void
  loading?: boolean
  color?: "danger" | "success" | "inherit"
}

export const ViewBottomButtonBar = ({
  children,
}: {
  children: VDomChildren
}) => {
  return (
    <div className="flex w-full items-center border-t border-neutral-500">
      {children}
    </div>
  )
}

export const ViewBottomButtonBarAction = (props: BottomBarButtonAction) => {
  const isDisabled = props.disabled || props.loading
  return (
    <button
      disabled={isDisabled}
      key={props.label}
      onClick={props.onClick}
      className={cn(
        "relative flex flex-1 flex-col items-center gap-0.5 p-2 text-sm transition-opacity",
        !isDisabled && "active:opacity-50",
        props.disabled && "cursor-not-allowed opacity-50",
        props.color === "danger" && "text-red-500",
        props.color === "success" && "text-green-500",
        props.classNames?.button,
      )}
    >
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-0.5 transition-opacity",
          props.loading ? "opacity-0" : "opacity-100",
        )}
      >
        {props.icon({ className: "h-7 w-7" })}
        <p className={cn("text-xs", props.classNames?.label)}>{props.label}</p>
      </div>

      <div
        className={cn(
          "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
          props.loading ? "opacity-100" : "opacity-0",
        )}
      >
        <Spinner className="h-8 w-8" />
      </div>
    </button>
  )
}
