import { Props, propsSub } from './shared'

if (typeof window !== 'undefined') {
  class ClickOutsideElement extends HTMLElement {
    private unsubscribe: (() => void) | null = null
    private props: Props | null = null
    private abortController: AbortController | null = null
    private onClick: (event: MouseEvent) => void

    constructor() {
      super()
      this.onClick = (e: MouseEvent) => {
        if (e.target instanceof Node && !this.contains(e.target)) {
          this.props?.onClickOutside?.()
        }
      }
    }

    connectedCallback() {
      this.abortController = new AbortController()
      document.addEventListener('click', this.onClick, { signal: this.abortController.signal })
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
