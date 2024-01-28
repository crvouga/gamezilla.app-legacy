import { VDom } from "./ui";

export const ListItemButton = ({
  label,
  icon,
  onClick,
}: {
  icon: (props: { className: string }) => VDom;
  label: string;
  onClick?: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 p-4 text-lg font-bold"
    >
      {icon({ className: "h-6 w-6" })}
      {label}
    </button>
  );
};
