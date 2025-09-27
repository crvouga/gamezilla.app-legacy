import { IDb } from '../interface'
import { ImplHashMap } from './impl-hash-map'
import { ImplOneWaySyncRemoteToLocal } from './impl-one-way-sync-remote-to-local/impl'
import { ImplSqlDb } from './impl-sql-db'

export type Db<
  TEntity extends Record<string, unknown>,
  TRelated extends Record<string, unknown>,
  TRow extends Record<string, unknown> = Record<string, unknown>,
> = ImplSqlDb<TEntity, TRelated, TRow> | ImplHashMap<TEntity, TRelated> | ImplOneWaySyncRemoteToLocal<TEntity, TRelated>

const init = <
  TEntity extends Record<string, unknown>,
  TRelated extends Record<string, unknown>,
  TRow extends Record<string, unknown> = Record<string, unknown>,
>(
  config: Db<TEntity, TRelated, TRow>,
): IDb.IDb<TEntity, TRelated> => {
  switch (config.t) {
    case 'sql-db':
      return ImplSqlDb.init(config)
    case 'hash-map':
      return ImplHashMap.init(config)
    case 'one-way-sync-remote-to-local':
      return ImplOneWaySyncRemoteToLocal.init(config)
  }
}

export const Db = {
  init,
}
