import * as ImplInMemory from './impl-in-memory'
import * as ImplSql from './impl-sql'
import * as ImplSqlWithCache from './impl-sql-with-cache'
import type { IUserSessionDb } from './interface'
import { UploadData } from './upload-data'

export type Config = ImplInMemory.Config | ImplSql.Config | ImplSqlWithCache.Config

export const UserSessionDb = async (config: Config): Promise<IUserSessionDb> => {
  switch (config.t) {
    case 'in-memory': {
      return ImplInMemory.UserSessionDb(config)
    }

    case 'sql': {
      return ImplSql.UserSessionDb(config)
    }

    case 'sql-with-cache': {
      return ImplSqlWithCache.UserSessionDb(config)
    }
  }
}

UserSessionDb.UploadData = UploadData
