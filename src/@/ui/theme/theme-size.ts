export type ThemeSize = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'

const toWidthPixel = (size: ThemeSize): number => {
  switch (size) {
    case '3xs':
      return 256 // 16rem
    case '2xs':
      return 288 // 18rem
    case 'xs':
      return 320 // 20rem
    case 'sm':
      return 384 // 24rem
    case 'md':
      return 448 // 28rem
    case 'lg':
      return 480 // 30rem
    case 'xl':
      return 512 // 32rem
    case '2xl':
      return 672 // 42rem
    case '3xl':
      return 768 // 48rem
    case '4xl':
      return 896 // 56rem
    case '5xl':
      return 1024 // 64rem
    case '6xl':
      return 1152 // 72rem
    case '7xl':
      return 1280 // 80rem
  }
}

export const ThemeSize = {
  toWidthPixel,
}
