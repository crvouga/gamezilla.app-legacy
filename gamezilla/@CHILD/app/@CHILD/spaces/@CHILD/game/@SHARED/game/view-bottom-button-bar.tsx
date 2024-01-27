import { Spinner, VDom, cn } from "gamezilla/@CHILD/app/@SHARED/ui";

export type BottomBarButtonAction = {
  label: string;
  disabled?: boolean;
  icon: VDom;
  classNames?: {
    button?: string;
    label?: string;
  };
  onClick: () => void;
  loading?: boolean;
  color?: "danger" | "success" | "inherit";
};

export const ViewBottomButtonBar = ({
  actions,
}: {
  actions: BottomBarButtonAction[];
}) => {
  return (
    <div className={"flex w-full items-center border-t border-neutral-600"}>
      {actions.map((action) => {
        return (
          <button
            disabled={action.disabled || action.loading}
            key={action.label}
            onClick={action.onClick}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 p-1 text-sm active:opacity-50",
              action.disabled && "opacity-50",
              action.color === "danger" && "text-red-500",
              action.color === "success" && "text-green-500",
              // color === "default" && "text-inherit",
              action.classNames?.button
            )}
          >
            {action.icon}
            <p className={cn("text-xs", action.classNames?.label)}>
              {action.label}
            </p>
            {action.loading && (
              <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/60">
                <Spinner className="h-8 w-8" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
