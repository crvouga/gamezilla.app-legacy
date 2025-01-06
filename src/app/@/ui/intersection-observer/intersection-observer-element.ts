import { type IntersectionObserverEmitterinput, sub } from './intersection-observer-shared'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'intersection-observer-dispatcher': {
        id: string
      }
    }
  }
}
if (typeof window !== 'undefined' && 'customElements' in window) {
  class IntersectionObserverEmitter extends HTMLElement {
    private unsubscribe: () => void = () => {}
    private input: IntersectionObserverEmitterinput | null = null
    private intersectionObserver: IntersectionObserver | null = null
    private queue: IntersectionObserverEntry[] = []

    constructor() {
      super()

      this.attachShadow({
        mode: 'open',
      })

      if (!('IntersectionObserver' in window)) {
        return
      }

      this.intersectionObserver = new IntersectionObserver(this.onIntersection, {
        rootMargin: '0px',
        threshold: 1.0,
      })
    }

    connectedCallback() {
      this.unsubscribe = sub.sub((msgEvt) => {
        if (msgEvt.input.id !== this.getAttribute('id')) {
          return
        }
        this.input = msgEvt.input

        if (this.queue.length > 0) {
          this.onIntersection(this.queue)
          this.queue = []
        }
      })

      this.intersectionObserver?.observe(this)
    }

    disconnectedCallback() {
      this.intersectionObserver?.disconnect()
      this.unsubscribe()
    }

    private onIntersection = (entries: IntersectionObserverEntry[]) => {
      if (typeof this.input?.onVisible !== 'function') {
        this.queue.push(...entries)
        return
      }
      this.input.onVisible()
    }
  }

  customElements.define('intersection-observer-dispatcher', IntersectionObserverEmitter)
}
