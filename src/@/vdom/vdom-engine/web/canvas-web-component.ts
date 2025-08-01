import { Sub } from '~/@/sub'
import { h } from '../impl'
import { tag } from '../interface'

type CanvasWebComponentProps = {
  id: string
  onContextCreate?: (gl: WebGLRenderingContext) => void
  msaaSamples?: number
  style?: Record<string, unknown>
}

const propsSub = Sub.init<CanvasWebComponentProps>()

const CANVAS_WEB_COMPONENT_TAG = tag('canvas-web-component')

if (typeof window !== 'undefined') {
  class CanvasWebComponentElement extends HTMLElement {
    private cleanup: (() => void)[] = []
    private canvas: HTMLCanvasElement | null = null
    private gl: WebGLRenderingContext | null = null

    constructor() {
      super()
      this.attachShadow({ mode: 'open' })

      // Create canvas element
      this.canvas = document.createElement('canvas')
      this.shadowRoot?.appendChild(this.canvas)

      this.cleanup.push(
        propsSub.sub((props) => {
          if (props.id === this.getAttribute('id')) {
            if (!this.gl && this.canvas) {
              const contextAttributes: WebGLContextAttributes = {
                antialias: props.msaaSamples !== 0,
                preserveDrawingBuffer: true,
              }
              this.gl = this.canvas.getContext('webgl', contextAttributes)

              if (this.gl && props.onContextCreate) {
                props.onContextCreate(this.gl)
              }
            }

            // Apply styles
            if (props.style && this.canvas) {
              Object.assign(this.canvas.style, props.style)
            }
          }
        }),
      )
    }

    disconnectedCallback() {
      this.cleanup.forEach((fn) => fn())
      this.gl = null
    }
  }

  window.customElements.define(CANVAS_WEB_COMPONENT_TAG, CanvasWebComponentElement)
}

export const CanvasWebComponent = (props: CanvasWebComponentProps) => {
  propsSub.pub(props)
  return h(CANVAS_WEB_COMPONENT_TAG, props, [])
}
