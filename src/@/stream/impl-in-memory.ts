import { Parser } from '~/@/parser/parser'
import { KeyValueDb } from '../db-conn-kv'
import * as ImplKeyValueDb from './impl-db-conn-kv'
import { IStream } from './interface'

export type Config<T> = {
  t: 'in-memory'
  parser: Parser<T>
}

export const Stream = async <T>(config: Config<T>): Promise<IStream<T>> => {
  return ImplKeyValueDb.Stream<T>({
    t: 'db-conn-kv',
    keyValueDb: await KeyValueDb({
      t: 'hash-map',
      map: new Map(),
    }),
    parser: config.parser,
  })
}
