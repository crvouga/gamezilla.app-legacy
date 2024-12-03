import { waitForElementById } from '~/@/core/dom'
import type { VDomChildren } from '~/@/vdom'

if (typeof window !== 'undefined') {
  import('swiper/element/bundle').then(({ register }) => {
    register()
  })
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

const onContainer = async (input: { id: string; onSlideIndexChanged: (index: number) => void }) => {
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
      input.onSlideIndexChanged(activeIndex)
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
    subtree: true
  })
}

const Container = (input: {
  id: string
  onSlideIndexChanged: (index: number) => void
  children?: VDomChildren
  className?: string
  slideIndex: number
}) => {
  onContainer(input)
  return (
    <swiper-container
      id={input.id}
      slides-per-view='auto'
      className={input.className}
      grab-cursor
      centered-slides
      initial-slide={input.slideIndex}
      slide={input.slideIndex}
    >
      {input.children}
    </swiper-container>
  )
}

const Slide = (input: { children?: VDomChildren; className?: string }) => {
  return <swiper-slide className={input.className}>{input.children}</swiper-slide>
}

export const Swiper = {
  Container,
  Slide
}
