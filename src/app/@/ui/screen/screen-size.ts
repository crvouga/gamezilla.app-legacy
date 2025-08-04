import { IViewport } from '~/@/viewport'

export type ScreenSize = 'mobile' | 'tablet' | 'desktop'

const MAX_MOBILE_SCREEN_WIDTH = 900
const MAX_TABLET_SCREEN_WIDTH = 1200

const to = (width: number): ScreenSize => {
  if (width < MAX_MOBILE_SCREEN_WIDTH) {
    return 'mobile'
  }

  if (width < MAX_TABLET_SCREEN_WIDTH) {
    return 'tablet'
  }

  return 'desktop'
}

const get = (viewport: IViewport): ScreenSize => {
  return to(viewport.size.get().width)
}

export const ScreenSize = {
  get,
  to,
}
