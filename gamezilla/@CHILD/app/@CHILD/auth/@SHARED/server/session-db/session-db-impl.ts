import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server"
import { ISessionDb } from "./session-db"
import { SessionDbInMemory } from "./session-db-impl.in-memory"
import { SessionDbPostgres } from "./session-db-impl.postgres"
import { SessionDbWithCache } from "./session-db-impl.with-cache"

export type Impl =
  | {
      t: "in-memory"
      delay: () => Promise<void>
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
      return SessionDbInMemory(impl)
    }

    case "postgres": {
      return SessionDbPostgres(impl)
    }

    case "postgres-with-cache": {
      return SessionDbWithCache({
        SessionDb: SessionDbPostgres(impl),
      })
    }
  }
}
