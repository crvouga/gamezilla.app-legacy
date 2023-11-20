import { VDom } from "./utils";

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
    <button class="rounded-full p-3" onClick={onClick} aria-label={label}>
      {children}
    </button>
  );
};
