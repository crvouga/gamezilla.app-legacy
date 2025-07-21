import { ImplAllowList } from './impl-allow-list'
import { ImplAllowSubDomains } from './impl-allow-sub-domains'
import { ICorsPolicy } from './interface'

export type CorsPolicy = ImplAllowList | ImplAllowSubDomains

const init = (config: CorsPolicy): ICorsPolicy => {
  switch (config.t) {
    case 'allow-list':
      return ImplAllowList.init(config)
    case 'allow-sub-domains':
      return ImplAllowSubDomains.init(config)
  }
}

export const CorsPolicy = {
  init,
}
