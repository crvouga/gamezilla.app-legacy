import { VDom } from "./utils";

export const MyDrawer = ({
  open,
  children,
  onClose,
}: {
  onClose?: () => void;
  open?: boolean;
  children?: VDom | VDom[];
}) => {
  if (!open) {
    return <></>;
  }

  return (
    <div
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose?.();
        }
      }}
      className="absolute left-0 top-0 z-40 flex h-full w-full flex-col items-end justify-end bg-black/60">
      <div className="w-full flex-1" onClick={onClose}></div>
      <div className="h-auto w-full border border-neutral-700 bg-black">
        {children}
      </div>
    </div>
  );
};
