import { createPortal } from '~/@/vdom/render'
import { VDom } from '~/@/vdom/vdom'

const cache = new Map<string, HTMLElement>()
const querySelector = (selector: string): HTMLElement | null => {
  if (cache.has(selector)) {
    return cache.get(selector) ?? null
  }
  const element = document.querySelector(selector)
  if (element instanceof HTMLElement) {
    cache.set(selector, element)
    return element
  }
  return null
}

const getExit = (portalId: string): HTMLElement | null => {
  if (typeof document === 'undefined') return null
  return (querySelector(`[data-portal-exit][data-portal-id="${portalId}"]`) ?? null) as HTMLElement | null
}

const Entrance = (input: { portalId: string; children: VDom }) => {
  const element = getExit(input.portalId)
  if (!element) return input.children
  return (
    <div data-portal-entrance data-portal-id={input.portalId}>
      {createPortal?.(input.children, element)}
    </div>
  )
}

const Exit = (input: { portalId: string }) => {
  return <div id={input.portalId} data-portal-exit data-portal-id={input.portalId} />
}

export const Portal = {
  getExit,
  Entrance,
  Exit,
}
