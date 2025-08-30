import { ImplExpoSqlite } from './impl-expo-sqlite'
import { ImplNoop } from './impl-noop'
import type { ISqlDb } from './interface'

export type FrontendNativeSqlDb = ImplNoop | ImplExpoSqlite

const init = (config: FrontendNativeSqlDb): ISqlDb => {
  switch (config.t) {
    case 'noop':
      return ImplNoop.init(config)
    case 'expo-sqlite':
      return ImplExpoSqlite.init(config)
  }
}

export const FrontendNativeSqlDb = {
  init,
}
