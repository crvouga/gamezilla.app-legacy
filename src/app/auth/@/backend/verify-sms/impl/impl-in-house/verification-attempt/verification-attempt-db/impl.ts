import { IDbConnSql } from '~/@/db-conn-sql'
import type { IVerificationAttemptDb } from './interface'
import { VerificationAttemptDbHashMap } from './impl-hash-map'
import { VerificationAttemptDbPostgres } from './impl-sql'

export type Impl =
  | {
      t: 'hash-map'
    }
  | {
      t: 'postgres'
      dbConnSql: IDbConnSql
    }

export const VerificationAttemptDb = (impl: Impl): IVerificationAttemptDb => {
  switch (impl.t) {
    case 'hash-map': {
      return VerificationAttemptDbHashMap()
    }

    case 'postgres': {
      return VerificationAttemptDbPostgres(impl)
    }
  }
}
