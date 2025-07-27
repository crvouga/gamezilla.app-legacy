import { ViewportImplNoop } from './impl-noop'
import { ImplWebStandard } from './impl-web-standard'
import { IViewport } from './interface'

export type Viewport = ImplWebStandard | ViewportImplNoop

const init = (config: Viewport): IViewport => {
  switch (config.t) {
    case 'web-standard':
      return ImplWebStandard.init(config)
    case 'noop':
      return ViewportImplNoop.init(config)
  }
}

export const Viewport = {
  init,
}
