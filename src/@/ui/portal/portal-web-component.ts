import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import { IPortal } from './interface'

if (typeof window !== 'undefined') {
  const entrances = new Map<string, Set<HTMLElement>>()
  const exits = new Map<string, HTMLElement>()

  const registerEntrance = (id: string, element: HTMLElement) => {
    if (!entrances.has(id)) {
      entrances.set(id, new Set())
    }
    entrances.get(id)?.add(element)
    updatePortal(id)
  }

  const unregisterEntrance = (id: string, element: HTMLElement) => {
    const entranceSet = entrances.get(id)
    if (entranceSet) {
      entranceSet.delete(element)
      if (entranceSet.size === 0) {
        entrances.delete(id)
      }
      updatePortal(id)
    }
  }

  const registerExit = (id: string, element: HTMLElement) => {
    exits.set(id, element)
    updatePortal(id)
  }

  const unregisterExit = (id: string) => {
    exits.delete(id)
  }

  const updatePortal = (id: string) => {
    const entranceSet = entrances.get(id)
    const exit = exits.get(id)

    if (!exit) return

    // Clear existing content in exit
    while (exit.firstChild) {
      exit.removeChild(exit.firstChild)
    }

    // Aggregate and append children from all entrances to exit
    if (entranceSet && entranceSet.size > 0) {
      entranceSet.forEach((entrance) => {
        Array.from(entrance.childNodes).forEach((child) => {
          exit.appendChild(child.cloneNode(true))
        })
      })
    }
  }

  class PortalEntrance extends HTMLElement {
    private observer: MutationObserver
    private currentPortalId: string | null = null

    static get observedAttributes() {
      return ['portal-id']
    }

    constructor() {
      super()
      this.observer = new MutationObserver(() => {
        if (this.currentPortalId) {
          updatePortal(this.currentPortalId)
        }
      })
    }

    connectedCallback() {
      this.updatePortalId()
      this.observeChildChanges()
    }

    disconnectedCallback() {
      this.observer.disconnect()
      if (this.currentPortalId) {
        unregisterEntrance(this.currentPortalId, this)
      }
    }

    attributeChangedCallback() {
      this.updatePortalId()
    }

    private observeChildChanges() {
      this.observer.observe(this, {
        childList: true,
        subtree: true,
      })
    }

    private updatePortalId() {
      const newPortalId = this.getAttribute('portal-id')

      // Unregister from old portal if it exists
      if (this.currentPortalId && this.currentPortalId !== newPortalId) {
        unregisterEntrance(this.currentPortalId, this)
      }

      // Register with new portal
      if (newPortalId) {
        this.currentPortalId = newPortalId
        registerEntrance(newPortalId, this)
      } else {
        this.currentPortalId = null
      }
    }
  }

  class PortalExit extends HTMLElement {
    private currentPortalId: string | null = null

    static get observedAttributes() {
      return ['portal-id']
    }

    connectedCallback() {
      this.updatePortalId()
    }

    disconnectedCallback() {
      if (this.currentPortalId) {
        unregisterExit(this.currentPortalId)
      }
    }

    attributeChangedCallback() {
      this.updatePortalId()
    }

    private updatePortalId() {
      const newPortalId = this.getAttribute('portal-id')

      // Unregister from old portal if it exists
      if (this.currentPortalId && this.currentPortalId !== newPortalId) {
        unregisterExit(this.currentPortalId)
      }

      // Register with new portal
      if (newPortalId) {
        this.currentPortalId = newPortalId
        registerExit(newPortalId, this)
      } else {
        this.currentPortalId = null
      }
    }
  }

  customElements.define('portal-entrance', PortalEntrance)
  customElements.define('portal-exit', PortalExit)
}

const Entrance = (input: { portalId: string; children: VDom[] }) => {
  return h('portal-entrance', { 'portal-id': input.portalId }, input.children)
}

const Exit = (input: { portalId: string }) => {
  return h('portal-exit', { style: { 'z-index': 1000 }, 'portal-id': input.portalId })
}

export const Portal: IPortal = {
  Entrance,
  Exit,
}
