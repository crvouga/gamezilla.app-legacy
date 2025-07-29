import { IPlatform } from '~/@/platform/platform'

export type BorderImpl = { t: 'svg' } | { t: 'canvas' }

const fromPlatform = (platform: IPlatform): BorderImpl => {
  switch (platform) {
    case 'web':
      return { t: 'svg' }
    case 'native':
      return { t: 'canvas' }
  }
}

export const BorderImpl = {
  fromPlatform,
}
