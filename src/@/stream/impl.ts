import * as ImplInMemory from './impl-in-memory'
import * as ImplKeyValueDb from './impl-key-value-db'
import { IStream } from './interface'

export type Config<T> = ImplKeyValueDb.Config<T> | ImplInMemory.Config<T>

export const Stream = async <T>(config: Config<T>): Promise<IStream<T>> => {
  switch (config.t) {
    case 'key-value-db': {
      return ImplKeyValueDb.Stream(config)
    }
    case 'in-memory': {
      return ImplInMemory.Stream(config)
    }
  }
}
