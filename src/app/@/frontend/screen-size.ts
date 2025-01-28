export type ScreenSize = 'mobile' | 'tablet'

const to = (width: number): ScreenSize => {
  if (width < 720) {
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
