import { VDomChildren } from "../ui"
import { createPortal } from "./create-portal"

const PortalEntrance = ({
  portalId,
  children,
}: {
  portalId: string
  children: VDomChildren
}) => {
  const element = document.getElementById(portalId)
  if (!element) {
    return null
  }
  return (
    <div data-portal-entrance data-portal-id={portalId}>
      {createPortal(children, element)}
    </div>
  )
}

const PortalExit = ({ portalId }: { portalId: string }) => {
  return <div id={portalId} data-portal-exit data-portal-id={portalId}></div>
}

export const Portal = {
  Entrance: PortalEntrance,
  Exit: PortalExit,
}
