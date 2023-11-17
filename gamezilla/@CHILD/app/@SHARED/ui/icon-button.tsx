import { VDom } from "./utils";

export const IconButton = ({
  children,
  onClick,
}: {
  onClick?: () => void;
  children: VDom;
}) => {
  return (
    <button class="rounded-full p-3" onClick={onClick}>
      {children}
    </button>
  );
};
