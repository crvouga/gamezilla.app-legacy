import * as ImplHashMap from './impl-hash-map'
import * as ImplSql from './impl-sql'
import * as ImplWithSqlTables from './impl-with-sql-tables'
import type { IUserProfileDb } from './interface'
import { UploadData } from './upload-data'

export type Config = ImplHashMap.Config | ImplSql.Config | ImplWithSqlTables.Config

export const ProfileDb = (config: Config): IUserProfileDb => {
  switch (config.t) {
    case 'hash-map':
      return ImplHashMap.ProfileDb(config)
    case 'sql':
      return ImplSql.ProfileDb(config)
    case 'with-sql-tables':
      return ImplWithSqlTables.ProfileDb(config)
  }
}

ProfileDb.UploadData = UploadData
