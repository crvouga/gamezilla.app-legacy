import { Spinner, cn } from "gamezilla/@CHILD/app/@SHARED/ui"
import { VDom } from "gamezilla/@SHARED/vdom"

export type BottomBarButtonAction = {
  label: string
  disabled?: boolean
  icon: VDom
  classNames?: {
    button?: string
    label?: string
  }
  onClick: () => void
  loading?: boolean
  color?: "danger" | "success" | "inherit"
}

export const ViewBottomButtonBar = ({
  actions,
}: {
  actions: BottomBarButtonAction[]
}) => {
  return (
    <div className={"flex w-full items-center border-t border-neutral-600"}>
      {actions.map((action) => {
        const isDisabled = action.disabled || action.loading
        return (
          <button
            disabled={isDisabled}
            key={action.label}
            onClick={action.onClick}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 p-1 text-sm transition-opacity",
              !isDisabled && "active:opacity-50",
              action.disabled && "cursor-not-allowed opacity-50",
              action.color === "danger" && "text-red-500",
              action.color === "success" && "text-green-500",
              action.classNames?.button,
            )}
          >
            <div
              className={cn(
                "flex h-full w-full flex-col items-center justify-center gap-0.5 transition-opacity",
                action.loading ? "opacity-0" : "opacity-100",
              )}
            >
              {action.icon}
              <p className={cn("text-xs", action.classNames?.label)}>
                {action.label}
              </p>
            </div>

            <div
              className={cn(
                "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                action.loading ? "opacity-100" : "opacity-0",
              )}
            >
              <Spinner className="h-8 w-8" />
            </div>
          </button>
        )
      })}
    </div>
  )
}
