import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server"
import { ISessionDb } from "./session-db"
import { SessionDbInMemory } from "./session-db-impl.in-memory"
import { SessionDbPostgres } from "./session-db-impl.postgres"
import { SessionDbWithCache } from "./session-db-impl.with-cache"

export type Impl =
  | {
      t: "in-memory"
    }
  | {
      t: "postgres"
      dbConn: DbConnSql
    }
  | {
      t: "postgres-with-cache"
      dbConn: DbConnSql
    }

export const SessionDb = (impl: Impl): ISessionDb => {
  switch (impl.t) {
    case "in-memory": {
      return SessionDbInMemory()
    }

    case "postgres": {
      return SessionDbPostgres({ dbConn: impl.dbConn })
    }

    case "postgres-with-cache": {
      return SessionDbWithCache({
        SessionDb: SessionDbPostgres({ dbConn: impl.dbConn }),
      })
    }
  }
}
