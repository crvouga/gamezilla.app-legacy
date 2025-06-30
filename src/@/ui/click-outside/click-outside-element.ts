import { Props, propsSub } from './shared'

if (typeof window !== 'undefined') {
  class ClickOutsideElement extends HTMLElement {
    private unsubscribe: (() => void) | null = null
    private props: Props | null = null
    private abortController: AbortController | null = null
    private onClick: (event: MouseEvent) => void
    private onKeyDown: (event: KeyboardEvent) => void

    constructor() {
      super()
      this.onClick = (e: MouseEvent) => {
        if (e.target instanceof Node && !this.contains(e.target)) {
          this.props?.onClickOutside?.()
        }
      }
      this.onKeyDown = (e: KeyboardEvent) => {
        this.props?.onKeyDown?.(e)
      }
    }

    connectedCallback() {
      this.abortController = new AbortController()
      document.addEventListener('click', this.onClick, { signal: this.abortController.signal })
      document.addEventListener('keydown', this.onKeyDown, { signal: this.abortController.signal })
      this.unsubscribe = propsSub.sub((props) => {
        const id = this.getAttribute('id')
        if (!id) return
        if (props.id !== id) return
        this.props = props
      })
    }

    disconnectedCallback() {
      this.abortController?.abort()
      this.unsubscribe?.()
    }
  }

  customElements.define('click-outside', ClickOutsideElement)
}
