import { VDom } from "gamezilla-app/@SHARED/vdom";
import { cn } from "./ui";
export const ListItemButton = ({ label, icon, onClick, color = "default", end, className, }: {
    className?: string;
    icon: (props: {
        className: string;
    }) => VDom;
    end?: () => VDom;
    label: string;
    onClick?: () => void;
    color?: "default" | "danger" | "warning";
}) => {
    return (<button onClick={onClick} className={cn(className, "flex w-full items-center p-4 text-lg font-bold", color === "warning" && "text-orange-500", color === "danger" && "text-red-500")}>
      <div className="flex flex-1 items-center gap-3">
        {icon({ className: "h-6 w-6" })}

        {label}
      </div>
      {end && <div className="shrink-0">{end()}</div>}
    </button>);
};
