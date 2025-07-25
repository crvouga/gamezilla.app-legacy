import { Sub } from '../sub'
import { IViewport, ViewportSize, ViewportVisibility } from './interface'

export type Config = {
  t: 'web-standard'
}

export const Viewport = (_config: Config): IViewport => {
  return {
    visibility: {
      get: getDocumentVisibilityState,
      sub: onDocumentVisibilityState,
    },
    size: {
      get: getScreenSize,
      sub: (fn) => Sub.map(screenSizeSub, fn),
    },
  }
}

const getScreenSize = (): ViewportSize => {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
    }
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

const screenSizeSub = Sub.init<ViewportSize>()

if (typeof window !== 'undefined') {
  window.addEventListener(
    'resize',
    () => {
      screenSizeSub.pub(getScreenSize())
    },
    {
      passive: true,
    },
  )
}

const documentVisibilityState = Sub.init<ViewportVisibility>()

const onDocumentVisibilityState = <T>(fn: (state: ViewportVisibility) => T) => {
  return Sub.map(documentVisibilityState, fn)
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    documentVisibilityState.pub(document.visibilityState)
  })
}

const getDocumentVisibilityState = (): ViewportVisibility => {
  if (typeof document === 'undefined') {
    return 'visible'
  }
  return document.visibilityState
}
