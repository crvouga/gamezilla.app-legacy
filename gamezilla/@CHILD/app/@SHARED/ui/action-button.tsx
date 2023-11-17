import { VDom, cn } from "./utils";

export const ActionButton = ({
  label,
  icon,
  onClick,
  disabled = false,
  color,
}: {
  color?: "error" | "success";
  label: string;
  icon: VDom;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      key={label}
      onClick={onClick}
      disabled={disabled}
      class={cn(
        "flex flex-1 flex-col items-center p-1 text-sm active:opacity-50",
        disabled && "opacity-50",
        color === "error" && "text-red-500",
        color === "success" && "text-green-500"
      )}>
      {icon}
      <p class="mt-0.5 text-xs">{label}</p>
    </button>
  );
};
