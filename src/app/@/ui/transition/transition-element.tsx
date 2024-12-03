import { transitionSub, type Transitioninput } from './transition-shared'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'transition-element': {
        id: string
        children: unknown
      }
    }
  }
}

if (typeof window !== 'undefined' && 'customElements' in window) {
  class Transition extends HTMLElement {
    observer: MutationObserver
    unsubscribe: () => void
    input: Transitioninput
    enterQueue: Array<Node> = []
    activeExits = 0

    constructor() {
      super()
      this.observer = new MutationObserver(this.onMutations.bind(this))
      this.unsubscribe = () => {}
      this.input = {
        id: this.getAttribute('id') || '',
        onEnter: async () => {},
        onExit: async () => {},
        onAppear: async () => {},
        className: '',
        mode: 'in-out'
      }
    }

    connectedCallback() {
      this.observer.observe(this, {
        childList: true
      })
      this.unsubscribe = transitionSub.sub((msgEvt) => {
        if (msgEvt.id === this.getAttribute('id')) {
          this.input = msgEvt
          this.syncUI()
        }
      })

      if (this.input.appear) {
        Array.from(this.childNodes).forEach((child) => {
          if (child instanceof HTMLElement) {
            this.applyTransition(child, 'enter')
            if (this.input.onAppear) {
              this.input.onAppear(child)
            }
          }
        })
      }
    }

    syncUI() {
      this.className = this.input.className ?? ''
    }

    disconnectedCallback() {
      this.observer.disconnect()
      this.unsubscribe()
    }

    onMutations(mutationsList: MutationRecord[], _observer: MutationObserver) {
      switch (this.input.mode) {
        case 'in-out': {
          mutationsList.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => this.applyTransition(node, 'enter'))
              mutation.removedNodes.forEach((node) => this.applyTransition(node, 'exit'))
            }
          })
          break
        }
        case 'out-in': {
          mutationsList.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.removedNodes.forEach((node) => {
                this.applyTransition(node, 'exit')
              })

              mutation.addedNodes.forEach((node) => {
                if (node instanceof HTMLElement) {
                  node.style.visibility = 'hidden'
                }
                this.enterQueue.push(node)
              })
            }
          })

          if (this.activeExits === 0) {
            this.processEnterQueue()
          }
          break
        }
      }
    }

    override removeChild<T extends Node>(node: T): T {
      this.applyTransition(node, 'exit').then(() => {
        if (node.parentNode === this) {
          super.removeChild(node)
        }
      })
      return node
    }

    async applyTransition(node: Node, type: 'enter' | 'exit'): Promise<void> {
      if (!(node instanceof HTMLElement)) {
        return
      }

      if (type === 'exit') {
        this.activeExits++
      }

      try {
        if (type === 'enter') {
          node.style.visibility = 'visible'
          await this.input.onEnter?.(node)
        } else {
          await this.input.onExit?.(node)
        }
      } finally {
        if (type === 'exit') {
          this.activeExits--
          if (this.activeExits === 0) {
            this.processEnterQueue()
          }
        }
      }
    }

    processEnterQueue() {
      while (this.enterQueue.length > 0) {
        const node = this.enterQueue.shift()
        if (node) {
          this.applyTransition(node, 'enter')
        }
      }
    }
  }

  customElements.define('transition-element', Transition)
}
