import * as ImplInMemory from './impl-in-memory'
import * as ImplWebStandard from './impl-web-standard'
import { INavigation } from './interface'

export type Config = ImplWebStandard.Config | ImplInMemory.Config

export const Navigation = (config: Config): INavigation => {
  switch (config.t) {
    case 'web-standard':
      return ImplWebStandard.Navigation(config)
    case 'in-memory':
      return ImplInMemory.Navigation(config)
  }
}
