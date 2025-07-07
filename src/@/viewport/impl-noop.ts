import { Sub } from '../sub'
import { IViewport } from './interface'

export type Config = {
  t: 'noop'
}

export const Viewport = (_config: Config): IViewport => {
  return {
    visibility: {
      get: () => 'visible',
      sub: () => Sub.none(),
    },
    size: {
      get: () => ({ width: 0, height: 0 }),
      sub: () => Sub.none(),
    },
  }
}
