import { getWindowWidth } from '~/@/browser/browser'

export type ScreenSize = 'mobile' | 'tablet'

const MAX_MOBILE_SCREEN_WIDTH = 900

const to = (width: number): ScreenSize => {
  if (width < MAX_MOBILE_SCREEN_WIDTH) {
    return 'mobile'
  }

  return 'tablet'
}

const get = (): ScreenSize => {
  return to(getWindowWidth())
}

export const ScreenSize = {
  get,
  to,
}
