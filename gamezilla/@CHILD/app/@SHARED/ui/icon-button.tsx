import { VDom } from "./ui";

export const IconButton = ({
  children,
  onClick,
  label,
}: {
  onClick?: () => void;
  children: VDom;
  label: string;
}) => {
  return (
    <button className="rounded-full p-3" onClick={onClick} aria-label={label}>
      {children}
    </button>
  );
};
