import { VDom } from "gamezilla/@SHARED/vdom"
import { cn } from "./ui"

export const ListItemButton = ({
  label,
  icon,
  onClick,
  color = "default",
}: {
  icon: (props: { className: string }) => VDom
  label: string
  onClick?: () => void
  color?: "default" | "danger"
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 p-4 text-lg font-bold",
        color === "danger" && "text-red-500",
      )}
    >
      {icon({ className: "h-6 w-6" })}
      {label}
    </button>
  )
}
