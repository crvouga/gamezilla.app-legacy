import { IDb } from '../interface'
import * as ImplHashMap from './impl-hash-map'
import * as ImplOneWaySyncRemoteToLocal from './impl-one-way-sync-remote-to-local/impl'
import * as ImplSqlDb from './impl-sql-db'

export type Config<
  TEntity extends Record<string, unknown>,
  TRelated extends Record<string, unknown>,
  TRow extends Record<string, unknown> = Record<string, unknown>,
> =
  | ImplSqlDb.Config<TEntity, TRelated, TRow>
  | ImplHashMap.Config<TEntity, TRelated>
  | ImplOneWaySyncRemoteToLocal.Config<TEntity, TRelated>

export const Db = <
  TEntity extends Record<string, unknown>,
  TRelated extends Record<string, unknown>,
  TRow extends Record<string, unknown> = Record<string, unknown>,
>(
  config: Config<TEntity, TRelated, TRow>,
): IDb.IDb<TEntity, TRelated> => {
  switch (config.t) {
    case 'sql-db':
      return ImplSqlDb.Db(config)
    case 'hash-map':
      return ImplHashMap.Db(config)
    case 'one-way-sync-remote-to-local':
      return ImplOneWaySyncRemoteToLocal.Db(config)
  }
}
