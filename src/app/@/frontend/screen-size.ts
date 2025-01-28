export type ScreenSize = 'mobile' | 'tablet'

const MAX_MOBILE_SCREEN_WIDTH = 800

const to = (width: number): ScreenSize => {
  if (width < MAX_MOBILE_SCREEN_WIDTH) {
    return 'mobile'
  }

  return 'tablet'
}

const get = (): ScreenSize => {
  return to(typeof window === 'undefined' ? 0 : window.innerWidth)
}

export const ScreenSize = {
  get,
  to,
}
