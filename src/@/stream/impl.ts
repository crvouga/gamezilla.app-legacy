import * as ImplKeyValueDb from './impl-db-conn-kv'
import * as ImplInMemory from './impl-in-memory'
import * as ImplRedis from './impl-redis'
import { IStream } from './interface'

export type Config<T> = ImplKeyValueDb.Config<T> | ImplInMemory.Config<T> | ImplRedis.Config<T>

export const Stream = async <T>(config: Config<T>): Promise<IStream<T>> => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplKeyValueDb.Stream(config)
    }
    case 'in-memory': {
      return ImplInMemory.Stream(config)
    }
    case 'redis': {
      return ImplRedis.Stream(config)
    }
  }
}
