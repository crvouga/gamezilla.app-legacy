import * as ImplDbConnKv from './impl-db-conn-kv'
import * as ImplInMemory from './impl-in-memory'
import { IStream } from './inteface'

export type Config<T> = ImplDbConnKv.Config<T> | ImplInMemory.Config<T>

export const Stream = async <T>(config: Config<T>): Promise<IStream<T>> => {
  switch (config.t) {
    case 'db-conn-kv': {
      return ImplDbConnKv.Stream(config)
    }
    case 'in-memory': {
      return ImplInMemory.Stream(config)
    }
  }
}
