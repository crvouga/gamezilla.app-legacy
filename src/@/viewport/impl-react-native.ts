import { Dimensions } from 'react-native'
import { Sub } from '../sub'
import { IViewport, ViewportSize, ViewportVisibility } from './interface'

export type ViewportImplReactNative = {
  t: 'react-native'
}

const init = (_config: ViewportImplReactNative): IViewport => {
  const screenSizeSub = Sub.init<ViewportSize>()
  const visibilityState = Sub.init<ViewportVisibility>()

  const getScreenSize = (): ViewportSize => {
    const { width, height } = Dimensions.get('window')
    return {
      width,
      height,
    }
  }

  const onVisibilityState = <T>(fn: (state: ViewportVisibility) => T) => {
    return Sub.map(visibilityState, fn)
  }

  // React Native apps are always visible when running
  const getVisibilityState = (): ViewportVisibility => {
    return 'visible'
  }

  Dimensions.addEventListener('change', () => {
    screenSizeSub.pub(getScreenSize())
  })

  return {
    visibility: {
      get: getVisibilityState,
      sub: onVisibilityState,
    },
    size: {
      get: getScreenSize,
      sub: (fn) => Sub.map(screenSizeSub, fn),
    },
  }
}

export const ViewportImplReactNative = {
  init,
}
