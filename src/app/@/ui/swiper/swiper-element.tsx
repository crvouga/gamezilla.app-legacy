import { SwiperInput, swiperInput } from './shared'

class SwiperElement extends HTMLElement {
  previousActiveIndex: number
  swiper: HTMLElement | null = null
  props: SwiperInput | null = null

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          overflow: hidden;
          position: relative;
        }

        .swiper {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          gap: 1rem;
        }

        ::slotted(swiper-slide) {
          flex-shrink: 0;
          scroll-snap-align: center;
          width: 100%;
        }
      </style>
      <div class="swiper">
        <slot></slot>
      </div>
    `

    this._onScroll = this._onScroll.bind(this)
    this.previousActiveIndex = 0
  }

  connectedCallback() {
    this.swiper = this.shadowRoot!.querySelector('.swiper')
    this.swiper?.addEventListener('scroll', this._onScroll)
    this._updateInitialSlide()
    swiperInput.sub((input) => {
      if (input.id === this.id) {
        this.props = input
      }
    })
  }

  disconnectedCallback() {
    this.swiper?.removeEventListener('scroll', this._onScroll)
  }

  static get observedAttributes() {
    return ['initial-slide']
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'initial-slide' && oldValue !== newValue) {
      this._updateInitialSlide()
    }
  }

  _updateInitialSlide() {
    const initialSlide = parseInt(this.getAttribute('initial-slide') ?? '0', 10)
    const slides = Array.from(this.querySelectorAll('swiper-slide'))
    if (slides[initialSlide]) {
      slides[initialSlide].scrollIntoView({ behavior: 'smooth' })
      this.previousActiveIndex = initialSlide
    }
  }

  _onScroll() {
    const slides = Array.from(this.querySelectorAll('swiper-slide'))
    const swiperBounds = this.swiper?.getBoundingClientRect()
    if (!swiperBounds) return

    const activeIndex = slides.findIndex((slide) => {
      const bounds = slide.getBoundingClientRect()
      return bounds.left >= swiperBounds.left && bounds.right <= swiperBounds.right
    })

    if (activeIndex !== -1 && activeIndex !== this.previousActiveIndex) {
      this.dispatchEvent(
        new CustomEvent('swiperslidechange', {
          detail: { activeIndex }
        })
      )
      this.previousActiveIndex = activeIndex
    }
  }
}

declare global {
  namespace inferno.createElement.JSX {
    interface IntrinsicElements {
      'swiper-element': {
        id: string
        children: unknown
      }
    }
  }

  namespace JSX {
    interface IntrinsicElements {
      'swiper-element': {
        id: string
        children: unknown
      }
    }
  }
}

customElements.define('swiper-element', SwiperElement)
