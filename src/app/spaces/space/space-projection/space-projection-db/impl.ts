import * as ImplSqlDb from './impl-sql-db'
import type { ISpaceProjectionDb } from './interface'

export type Config = ImplSqlDb.Config

export const SpaceProjectionDb = async (config: Config): Promise<ISpaceProjectionDb> => {
  switch (config.t) {
    case 'sql-db':
      return ImplSqlDb.SpaceProjectionDb(config)
  }
}
