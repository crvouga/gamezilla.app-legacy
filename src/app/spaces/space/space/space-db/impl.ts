import * as ImplKeyValueDb from './impl-key-value-db'
import * as ImplSqlDb from './impl-sql-db'
import type { ISpaceDb } from './interface'

export type Config = ImplKeyValueDb.Config | ImplSqlDb.Config

export const SpaceDb = async (config: Config): Promise<ISpaceDb> => {
  switch (config.t) {
    case 'key-value-db':
      return ImplKeyValueDb.SpaceDb(config)
    case 'sql-db':
      return ImplSqlDb.SpaceDb(config)
  }
}
