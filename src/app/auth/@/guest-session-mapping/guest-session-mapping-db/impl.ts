import * as ImplHashMap from './impl-hash-map'
import * as ImplSql from './impl-sql'
import * as ImplWithSqlTables from './impl-with-sql-tables'
import { IGuestSessionMappingDb } from './interface'
import { UploadData } from './upload-data'

export type Config = ImplHashMap.Config | ImplSql.Config | ImplWithSqlTables.Config

export const GuestSessionMappingDb = (config: Config): IGuestSessionMappingDb => {
  switch (config.t) {
    case 'hash-map': {
      return ImplHashMap.GuestSessionMappingDb(config)
    }

    case 'sql': {
      return ImplSql.GuestSessionMappingDb(config)
    }

    case 'with-sql-tables': {
      return ImplWithSqlTables.GuestSessionMappingDb(config)
    }
  }
}

GuestSessionMappingDb.UploadData = UploadData
