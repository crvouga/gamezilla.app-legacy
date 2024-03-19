import { createPortal, VDomChildren } from "gamezilla-app/@SHARED/vdom";
const getExit = (portalId: string): HTMLElement => {
    return document.querySelector(`[data-portal-exit][data-portal-id="${portalId}"]`) as HTMLElement;
};
const PortalEntrance = ({ portalId, children, }: {
    portalId: string;
    children: VDomChildren;
}) => {
    const element = getExit(portalId);
    if (!element) {
        return null;
    }
    return (<div data-portal-entrance data-portal-id={portalId}>
      {createPortal(children, element)}
    </div>);
};
const PortalExit = ({ portalId }: {
    portalId: string;
}) => {
    return <div id={portalId} data-portal-exit data-portal-id={portalId}></div>;
};
export const Portal = {
    getExit,
    Entrance: PortalEntrance,
    Exit: PortalExit,
};
