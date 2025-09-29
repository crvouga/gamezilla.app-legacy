import { Sub } from '../sub'
import { IViewport, ViewportSize, ViewportVisibility } from './interface'

export type ImplWebStandard = {
  t: 'web-standard'
}

const init = (_config: ImplWebStandard): IViewport => {
  const screenSizeSub = Sub.init<ViewportSize>()
  const documentVisibilityState = Sub.init<ViewportVisibility>()

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

  const onDocumentVisibilityState = <T>(fn: (state: ViewportVisibility) => T) => {
    return Sub.map(documentVisibilityState, fn)
  }

  const getDocumentVisibilityState = (): ViewportVisibility => {
    if (typeof document === 'undefined') {
      return 'visible'
    }
    return document.visibilityState
  }

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

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      documentVisibilityState.pub(document.visibilityState)
    })
    document.addEventListener('visibilitychange', () => {
      documentVisibilityState.pub(document.visibilityState)
    })
  }

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

export const ImplWebStandard = {
  init,
}
