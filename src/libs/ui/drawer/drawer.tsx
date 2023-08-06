import { VDom } from "../utils";
import "./drawer-element";

export const Drawer = ({
  id = "my-drawer",
  open,
  onClose,
  children,
}: {
  id?: string;
  open: boolean;
  onClose: () => void;
  children?: VDom | VDom[];
}) => {
  window.customElementsCallbacks.set(`${id}/onClose`, onClose);

  return (
    <my-bottom-drawer id={id} open={open}>
      <div class="w-full border border-neutral-700 bg-black">{children}</div>
    </my-bottom-drawer>
  );
};
