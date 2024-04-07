import { IDbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { IDbConnSql } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-sql"
import { ISessionDb } from "./session-db"
import { SessionDbInMemory } from "./session-db-impl.in-memory"
import { SessionDbPostgres } from "./session-db-impl.postgres"
import { SessionDbWithDbKvCache } from "./session-db-impl.with-db-kv-cache"

export type Impl =
  | {
      t: "in-memory"
      delay: () => Promise<void>
    }
  | {
      t: "postgres"
      dbConnSql: IDbConnSql
    }
  | {
      t: "postgres-with-db-kv-cache"
      dbConnSql: IDbConnSql
      dbConnKv: IDbConnKv
    }

export const SessionDb = (impl: Impl): ISessionDb => {
  switch (impl.t) {
    case "in-memory": {
      return SessionDbInMemory(impl)
    }

    case "postgres": {
      return SessionDbPostgres(impl)
    }

    case "postgres-with-db-kv-cache": {
      return SessionDbWithDbKvCache({
        SessionDb: SessionDbPostgres(impl),
        dbConnKv: impl.dbConnKv,
      })
    }
  }
}
