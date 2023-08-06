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
  window.customElementsCallbacks.set(`${id}/onClose`, onClose);

  console.log(`Drawer: ${id} ${open}`);
  return (
    <my-bottom-drawer id={id} open={open}>
      <div class="w-full border border-neutral-700 bg-black">{children}</div>
    </my-bottom-drawer>
  );
};
