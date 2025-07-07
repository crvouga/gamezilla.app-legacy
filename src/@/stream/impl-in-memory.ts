import { Schema } from '~/@/schema/schema'
import { KeyValueDb } from '../key-value-db'
import * as ImplKeyValueDb from './impl-key-value-db'
import { IStream } from './interface'

export type Config<T> = {
  t: 'in-memory'
  schema: Schema<T>
}

export const Stream = async <T>(config: Config<T>): Promise<IStream<T>> => {
  return ImplKeyValueDb.Stream<T>({
    t: 'key-value-db',
    keyValueDb: KeyValueDb({
      t: 'hash-map',
      map: new Map(),
    }),
    schema: config.schema,
  })
}
