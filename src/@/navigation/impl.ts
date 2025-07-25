import { ImplInMemory } from './impl-in-memory'
import { ImplWebStandard } from './impl-web-standard'
import { INavigation } from './interface'

export type Navigation = ImplWebStandard | ImplInMemory

const init = (config: Navigation): INavigation => {
  switch (config.t) {
    case 'web-standard':
      return ImplWebStandard.init(config)
    case 'in-memory':
      return ImplInMemory.init(config)
  }
}

export const Navigation = {
  init,
}
