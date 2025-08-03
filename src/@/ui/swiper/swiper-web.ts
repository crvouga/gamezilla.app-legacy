import { register } from 'swiper/element/bundle'
import { waitForElementById } from '~/@/dom/dom'
import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'

if (typeof window !== 'undefined') {
  register()
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'swiper-container': any
      'swiper-slide': any
    }
  }
}
const mountedElementIds = new Set<string>()

const onContainer = async (input: { id: string; onSlideIndexChanged?: (index: number) => void }) => {
  if (mountedElementIds.has(input.id)) {
    return
  }

  const swiperElement = await waitForElementById(input.id)

  if (!swiperElement) {
    return
  }

  mountedElementIds.add(input.id)

  // @ts-expect-error
  let previousActiveIndex = swiperElement.swiper?.activeIndex ?? 0
  const onSlideChangeEventHandler = (event: Event) => {
    // @ts-expect-error
    const swiper = event?.detail?.[0]
    const activeIndex = swiper?.activeIndex ?? 0
    if (activeIndex !== previousActiveIndex) {
      input.onSlideIndexChanged?.(activeIndex)
      previousActiveIndex = activeIndex
    }
  }

  swiperElement.addEventListener('swiperslidechange', onSlideChangeEventHandler)

  const observer = new MutationObserver((mutations) => {
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i]!
      for (let j = 0; j < mutation.removedNodes.length; j++) {
        const node = mutation.removedNodes[j]!
        if (node.contains(swiperElement)) {
          mountedElementIds.delete(input.id)
          observer.disconnect()
          swiperElement.removeEventListener('swiperslidechange', onSlideChangeEventHandler)
          swiperElement.remove()
        }
      }
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

const Container = (input: {
  id: string
  onSlideIndexChanged?: (index: number) => void
  children?: VDom
  style?: Record<string, unknown>
  slideIndex: number
}) => {
  onContainer(input)
  return h(
    // @ts-ignore
    'swiper-container',
    {
      id: input.id,
      'slides-per-view': 'auto',
      style: input.style,
      'grab-cursor': true,
      'centered-slides': true,
      'initial-slide': input.slideIndex,
      slide: input.slideIndex,
      role: 'tablist',
    },
    [input.children],
  )
}

const Slide = (input: { children?: VDom; style?: Record<string, unknown> }) => {
  return h(
    // @ts-ignore
    'swiper-slide',
    {
      style: input.style,
      role: 'tabpanel',
    },
    [input.children],
  )
}

export const Swiper = {
  Container,
  Slide,
}
