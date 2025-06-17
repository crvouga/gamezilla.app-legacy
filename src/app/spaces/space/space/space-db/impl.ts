import * as ImplSqlDb from './impl-sql-db'
import type { ISpaceDb } from './interface'
import { UploadData } from './upload-data'

export type Config = ImplSqlDb.Config

export const SpaceDb = async (config: Config): Promise<ISpaceDb> => {
  switch (config.t) {
    case 'sql-db': {
      return ImplSqlDb.SpaceDb(config)
    }
  }
}

SpaceDb.UploadData = UploadData
