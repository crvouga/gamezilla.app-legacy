import { VDom } from "../utils";
import "./drawer-element";

export const Drawer = ({
  id,
  open,
  onClose,
  children,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  children?: VDom | VDom[];
}) => {
  const drawerId = `drawer/${id}`;
  window.customElementsCallbacks.set(`${drawerId}/onClose`, onClose);
  return (
    <bottom-drawer id={drawerId} open={open}>
      <div class="w-full border border-neutral-700 bg-black">{children}</div>
    </bottom-drawer>
  );
};
