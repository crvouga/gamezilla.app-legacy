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

const toExitQuerySelector = (portalId: string): string => {
  return `[data-portal-exit][data-portal-id="${portalId}"]`
}

const getExit = (portalId: string): HTMLElement | null => {
  if (typeof document === 'undefined') return null
  return (querySelector(toExitQuerySelector(portalId)) ?? null) as HTMLElement | null
}

const Entrance = (input: { portalId: string; children: VDom; noPortal?: boolean }) => {
  const element = getExit(input.portalId)
  if (!element || input.noPortal) return input.children
  return (
    <div key={input.portalId} data-portal-entrance data-portal-id={input.portalId}>
      {createPortal?.(input.children, element)}
    </div>
  )
}

const Exit = (input: { portalId: string }) => {
  return <div id={input.portalId} data-portal-exit data-portal-id={input.portalId} />
}

export const Portal = {
  Entrance,
  Exit,
}
