import { VDomChildren } from "./utils";

export const ButtonVertical = ({
  children,
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
  children?: VDomChildren;
}) => {
  return (
    <button
      className={[
        "flex h-14 w-14 flex-col items-center justify-center",
        className ? className : "",
      ].join(" ")}
      onClick={onClick}>
      {children}
    </button>
  );
};
