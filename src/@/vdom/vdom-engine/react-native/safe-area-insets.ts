import { Dimensions, Platform, StatusBar } from 'react-native'

const { height, width } = Dimensions.get('window')

export type SafeAreaInsets = {
  top: number
  bottom: number
  left: number
  right: number
}

const get = (): SafeAreaInsets => {
  if (Platform.OS === 'web' && width > 1024) {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }
  }

  const isIPhoneWithNotch = Platform.OS === 'ios' && (height >= 812 || width >= 812)

  return {
    top: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : isIPhoneWithNotch ? 44 : 20,
    bottom: isIPhoneWithNotch ? 34 : 0,
    left: 0,
    right: 0,
  }
}

export const SafeAreaInsets = {
  get,
}
