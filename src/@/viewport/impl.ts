import * as ImplNoop from './impl-noop'
import * as ImplWebStandard from './impl-web-standard'
import { IViewport } from './interface'

export type Config = ImplWebStandard.Config | ImplNoop.Config

export const Viewport = (config: Config): IViewport => {
  switch (config.t) {
    case 'web-standard':
      return ImplWebStandard.Viewport(config)
    case 'noop':
      return ImplNoop.Viewport(config)
  }
}
