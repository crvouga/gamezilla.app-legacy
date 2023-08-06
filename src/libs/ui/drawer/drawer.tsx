import { VDom } from "../utils";
import "./drawer-element";

export const Drawer = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children?: VDom | VDom[];
}) => {
  return (
    <>
      {open ? <div>OPENED</div> : <div>CLOSED</div>}
      <my-bottom-drawer open={open} onClose={onClose}>
        <div class="w-full border border-neutral-700 bg-black">{children}</div>
      </my-bottom-drawer>
    </>
  );
};
