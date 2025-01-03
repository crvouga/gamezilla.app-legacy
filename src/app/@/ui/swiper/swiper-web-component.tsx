import { SwiperInput, swiperInput } from './shared'

class SwiperContainer extends HTMLElement {
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
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch; /* Enables momentum scrolling on touch devices */
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          gap: 0; /* Remove gap to prevent spacing between slides */
        }

        ::slotted(swiper-slide) {
          flex-shrink: 0;
          scroll-snap-align: center;
          width: 100%; /* Each slide occupies the full width of the container */
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
    console.log('connected', this.props)
    swiperInput.sub((input) => {
      console.log('sub', input)
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
      return Math.round(bounds.left) === Math.round(swiperBounds.left)
    })
    if (activeIndex !== -1 && activeIndex !== this.previousActiveIndex) {
      this.props?.onSlideIndexChanged(activeIndex)
      this.previousActiveIndex = activeIndex
    }
  }
}

class SwiperSlide extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }
      </style>
      <slot></slot>
    `
  }
}

customElements.define('swiper-container', SwiperContainer)
customElements.define('swiper-slide', SwiperSlide)
