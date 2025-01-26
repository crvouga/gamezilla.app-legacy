import type { PrivateDrawerInput } from '../drawer-shared'
import { drawerSub } from './drawer-shared'

declare global {
  namespace inferno.createElement.JSX {
    interface IntrinsicElements {
      'drawer-element': {
        id: string
        children: unknown
        position: 'bottom' | 'top'
      }
    }
  }

  namespace JSX {
    interface IntrinsicElements {
      'drawer-element': {
        id: string
        children: unknown
        position: 'bottom' | 'top'
      }
    }
  }
}

if (typeof window !== 'undefined' && 'customElements' in window) {
  const ANIMATION_START_DELAY = 10
  const ANIMATION_DURATION = 200

  class Drawer extends HTMLElement {
    private backdrop: HTMLElement | null = null
    private content: HTMLElement | null = null
    private root: HTMLElement | null = null

    private unsubscribe: () => void = () => {}
    private input: PrivateDrawerInput | null = null

    constructor() {
      super()
      this.attachShadow({
        mode: 'open',
      })
      // Bind methods to ensure correct 'this' context
      this.onKeyDown = this.onKeyDown.bind(this)
    }

    disconnectedCallback() {
      this.unsubscribe()
      window.removeEventListener('keydown', this.onKeyDown)
    }

    connectedCallback() {
      this.unsubscribe = drawerSub.sub((drawerEvent) => {
        if (drawerEvent.id === this.getAttribute('id')) {
          this.input = {
            ...drawerEvent,
          }

          this.syncUI()
        }
      })

      window.addEventListener('keydown', this.onKeyDown)

      if (!this.shadowRoot) {
        return
      }

      this.shadowRoot.innerHTML = `
      <style>
        .root {
          position: absolute;
          inset: 0;
          width: 100%;
          max-width: 100%;
          height: 100%;
          max-height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 100;
          background-color: rgba(0, 0, 0, 0);
          transition: background-color 0.2s ease-in-out;
        }
        .root-top {
          flex-direction: column-reverse;
        }
        .root-bottom {
          flex-direction: column;
        }
        .content-bottom {
          transition: transform 0.2s ease-in-out;
          transform: translateY(100%);
        }
        .content-top {
          transition: transform 0.2s ease-in-out;
          transform: translateY(-100%);
        }
        .content {
          width: 100%;
          max-width: 100%;
          max-height: 100%;
          overflow: hidden;
        }
        .backdrop {
          flex: 1;
          width: 100%;
          opacity: 0;
          transition: opacity 0.2s ease-in-out;
        }
        .darken-background {
          background-color: rgba(0, 0, 0, 0.8);
        }
        .visible {
          opacity: 1;
        }
        .open {
          transform: translateY(0%);
        }
        .hidden {
          visibility: hidden;
          pointer-events: none;
        }
      </style>
      <div class="root">
        <div class="backdrop"></div>
        <div class="content">
          <slot></slot>
        </div>
      </div>
    `

      this.root = this.shadowRoot.querySelector('.root')
      this.backdrop = this.shadowRoot.querySelector('.backdrop')
      this.content = this.shadowRoot.querySelector('.content')

      this.backdrop?.addEventListener('click', () => {
        this.onClose()
      })

      if (this.root) {
        this.root.classList.add('hidden')
      }

      const position = this.getAttribute('position')

      this.setupPosition(position)
    }

    static get observedAttributes() {
      return ['position']
    }

    setupPosition(position: string | null | undefined) {
      if (!this.root || !this.content) return

      switch (position) {
        case 'bottom':
          this.root.classList.add('root-bottom')
          this.content.classList.add('content-bottom')
          break
        case 'top':
          this.root.classList.add('root-top')
          this.content.classList.add('content-top')
          break
        default: {
          break
        }
      }
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
      if (name === 'position') {
        this.setupPosition(newValue)
      }
    }

    onClose() {
      if (this.root) {
        this.root.blur()
      }
      this.blur()
      this.input?.onClose()
    }

    onKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === 'Escape') {
        this.onClose()
      }
    }

    syncUI() {
      if (!this.input || !this.content || !this.root || !this.backdrop) {
        return
      }

      if (this.input.open) {
        this.root.classList.remove('hidden')
        setTimeout(() => {
          if (!this.content || !this.root || !this.backdrop) return
          this.content.classList.add('open')
          this.root.classList.add('darken-background')
          this.backdrop.classList.add('visible')
          this.root.tabIndex = 0
          this.tabIndex = 0
        }, ANIMATION_START_DELAY)
      } else {
        this.blur()
        this.tabIndex = -1
        this.root.tabIndex = -1
        this.backdrop.classList.remove('visible')
        this.content.classList.remove('open')
        this.root.classList.remove('darken-background')

        // Wait for animation to complete before hiding
        setTimeout(() => {
          if (!this.root) return
          this.root.classList.add('hidden')
        }, ANIMATION_DURATION)
      }

      switch (this.input.position) {
        case 'bottom': {
          this.root.style.top = 'auto'
          this.root.style.bottom = '0'
          this.root.style.flexDirection = 'column'
          this.content.classList.add('content-bottom')
          this.content.classList.remove('content-top')
          break
        }
        case 'top': {
          this.root.style.top = '0'
          this.root.style.bottom = 'auto'
          this.root.style.flexDirection = 'column-reverse'
          this.content.classList.add('content-top')
          this.content.classList.remove('content-bottom')
          break
        }
      }
    }
  }
  customElements.define('drawer-element', Drawer)
}
