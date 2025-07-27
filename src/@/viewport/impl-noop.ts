import { Sub } from '../sub'
import { IViewport } from './interface'

export type ViewportImplNoop = {
  t: 'noop'
}

const init = (_config: ViewportImplNoop): IViewport => {
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

export const ViewportImplNoop = {
  init,
}
