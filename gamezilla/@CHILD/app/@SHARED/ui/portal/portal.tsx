import { VDomChildren } from "../ui";
import { createPortal } from "./create-portal";

const Entrance = ({
  portalId,
  children,
}: {
  portalId: string;
  children: VDomChildren;
}) => {
  const element = document.getElementById(portalId);
  if (!element) {
    return null;
  }
  return createPortal(children, element);
};

const Exit = ({ portalId }: { portalId: string }) => {
  return <div id={portalId}></div>;
};

export const Portal = {
  Entrance,
  Exit,
};
