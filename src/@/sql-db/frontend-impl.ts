import { ImplNoop } from './impl-noop'
import { ImplPglite } from './impl-pglite'
import type { ISqlDb } from './interface'

export type FrontendSqlDb = ImplNoop | ImplPglite

const init = (config: FrontendSqlDb): ISqlDb => {
  switch (config.t) {
    case 'noop':
      return ImplNoop.init(config)
    case 'pglite':
      return ImplPglite.init(config)
  }
}

export const FrontendSqlDb = {
  init,
}
