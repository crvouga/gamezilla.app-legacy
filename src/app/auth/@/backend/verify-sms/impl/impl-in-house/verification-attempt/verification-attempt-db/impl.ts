import { ISqlDb } from '~/@/sql-db'
import type { IVerificationAttemptDb } from './interface'
import { VerificationAttemptDbHashMap } from './impl-hash-map'
import { VerificationAttemptDbSqlDb } from './impl-sql-db'

export type Impl =
  | {
      t: 'hash-map'
    }
  | {
      t: 'sql-db'
      sqlDb: ISqlDb
    }

export const VerificationAttemptDb = (impl: Impl): IVerificationAttemptDb => {
  switch (impl.t) {
    case 'hash-map': {
      return VerificationAttemptDbHashMap()
    }

    case 'sql-db': {
      return VerificationAttemptDbSqlDb(impl)
    }
  }
}
