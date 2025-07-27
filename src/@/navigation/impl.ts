import { NavigationImplKeyValueDbSync } from './impl-key-value-db-sync'
import { ImplWebStandard } from './impl-web-standard'
import { INavigation } from './interface'

export type Navigation = ImplWebStandard | NavigationImplKeyValueDbSync

const init = (config: Navigation): INavigation => {
  switch (config.t) {
    case 'web-standard':
      return ImplWebStandard.init(config)
    case 'key-value-db-sync':
      return NavigationImplKeyValueDbSync.init(config)
  }
}

export const Navigation = {
  init,
}
