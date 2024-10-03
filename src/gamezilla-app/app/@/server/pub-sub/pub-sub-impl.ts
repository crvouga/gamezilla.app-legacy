import { PubSub as IPubSub } from 'gamezilla-app/@/core'
import * as ImplPostgres from './pub-sub-impl-postgres'

export type Config<T> = { t: 'in-memory' } | ImplPostgres.Config<T>

export const PubSub = <T>(impl: Config<T>) => {
  switch (impl.t) {
    case 'in-memory': {
      return IPubSub.create<T>()
    }

    case 'postgres': {
      return ImplPostgres.PubSub(impl)
    }
  }
}
