import { VDom, cn } from "gamezilla/@CHILD/app/@SHARED/ui";

export type BottomBarButtonAction = {
  label: string;
  disabled?: boolean;
  icon: VDom;
  classNames?: {
    button?: string
    label?: string
  }
  onClick: () => void;
  color?: "danger" | "success" | "inherit";
};

export const ViewBottomButtonBar = ({
  actions,
}: {
  actions: BottomBarButtonAction[];
}) => {
  return (
    <div className={"flex w-full items-center border-t border-neutral-600"}>
      {actions.map(({ classNames, label, disabled, icon, onClick, color = "default" }) => (
        <button
          disabled={disabled}
          key={label}
          onClick={onClick}
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 p-1 text-sm active:opacity-50",
            disabled && "opacity-50",
            color === "danger" && "text-red-500",
            color === "success" && "text-green-500",
            // color === "default" && "text-inherit",
            classNames?.button,
          )}>
          {icon}
          <p className={cn("text-xs", classNames?.label)}>{label}</p>
        </button>
      ))}
    </div>
  );
};
