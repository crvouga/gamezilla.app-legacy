import * as ImplKeyValueDb from './impl-key-value-db'
import * as ImplSqlDb from './impl-sql-db'
import type { ISpacesDb } from './interface'

export type Config = ImplKeyValueDb.Config | ImplSqlDb.Config

export const SpacesDb = async (config: Config): Promise<ISpacesDb> => {
  switch (config.t) {
    case 'key-value-db':
      return ImplKeyValueDb.SpacesDb(config)
    case 'sql-db':
      return ImplSqlDb.SpacesDb(config)
  }
}
