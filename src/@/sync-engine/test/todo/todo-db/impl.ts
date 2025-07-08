import * as ImplHashMap from './impl-hash-map'
import { ITodoDb } from './interface'

export type Config = ImplHashMap.Config

export const TodoDb = (config: Config): ITodoDb => {
  switch (config.t) {
    case 'hash-map':
      return ImplHashMap.TodoDb(config)
  }
}
