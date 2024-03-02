import { DbConnSql } from "gamezilla-app/@CHILD/app/@SHARED/server"
import { IAccountDb } from "./account-db"
import { AccountDbInMemory } from "./account-db-impl.in-memory"
import { AccountDbPostgres } from "./account-db-impl.postgres"

export type Impl =
  | {
      t: "postgres"
      dbConn: DbConnSql
    }
  | {
      t: "in-memory"
      delay: () => Promise<void>
    }

export const AccountDb = (impl: Impl): IAccountDb => {
  switch (impl.t) {
    case "in-memory": {
      return AccountDbInMemory(impl)
    }

    case "postgres": {
      return AccountDbPostgres(impl)
    }
  }
}
