import * as ImplInMemory from './impl-in-memory'
import * as ImplSql from './impl-sql'
import * as ImplWithSqlTables from './impl-with-sql-tables'
import type { IUserAccountDb } from './interface'
import { UploadData } from './upload-data'

export type Impl = ImplInMemory.Config | ImplSql.Config | ImplWithSqlTables.Config

export const UserAccountDb = (impl: Impl): IUserAccountDb => {
  switch (impl.t) {
    case 'in-memory': {
      return ImplInMemory.UserAccountDb(impl)
    }

    case 'sql': {
      return ImplSql.UserAccountDb(impl)
    }

    case 'with-sql-tables': {
      return ImplWithSqlTables.UserAccountDb(impl)
    }
  }
}

UserAccountDb.UploadData = UploadData
