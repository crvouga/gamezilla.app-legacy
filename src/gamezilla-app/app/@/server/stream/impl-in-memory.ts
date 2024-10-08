import { Parser } from 'gamezilla-app/@/core/parser/parser'
import { DbConnKv } from '../db-conn-kv'
import * as ImplDbConnKv from './impl-db-conn-kv'
import { IStream } from './inteface'

export type Config<T> = {
  t: 'in-memory'
  parser: Parser<T>
}

export const Stream = async <T>(config: Config<T>): Promise<IStream<T>> => {
  return ImplDbConnKv.Stream<T>({
    t: 'db-conn-kv',
    dbConnKv: await DbConnKv({
      t: 'hash-map',
      map: new Map()
    }),
    parser: config.parser
  })
}
