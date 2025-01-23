import { Parser } from '~/@/parser/parser'
import { KeyValueDb } from '../key-value-db'
import * as ImplKeyValueDb from './impl-key-value-db'
import { IStream } from './interface'

export type Config<T> = {
  t: 'in-memory'
  parser: Parser<T>
}

export const Stream = async <T>(config: Config<T>): Promise<IStream<T>> => {
  return ImplKeyValueDb.Stream<T>({
    t: 'key-value-db',
    keyValueDb: await KeyValueDb({
      t: 'hash-map',
      map: new Map(),
    }),
    parser: config.parser,
  })
}
