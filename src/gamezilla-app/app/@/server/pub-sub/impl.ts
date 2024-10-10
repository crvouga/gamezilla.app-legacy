import * as ImplPostgres from './impl-postgres'
import * as ImplInMemory from './impl-in-memory'
import { IPubSub } from './interface'

export type Config = ImplPostgres.Config | ImplInMemory.Config

export const PubSub = async (config: Config): Promise<IPubSub> => {
  switch (config.t) {
    case 'postgres': {
      return ImplPostgres.PubSub(config)
    }
    case 'in-memory': {
      return ImplInMemory.PubSub(config)
    }
  }
}
