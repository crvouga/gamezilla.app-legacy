import { DbConnSql } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-sql"
import { IFlowPuzzleDb } from "./flow-puzzle-db"
import { FlowPuzzleDbHashMap } from "./flow-puzzle-db-impl-hash-map"
import { FlowPuzzleDbPostgres } from "./flow-puzzle-db-impl-postgres"

export type FlowPuzzleDbImpl =
  | { t: "hash-map" }
  | { t: "postgres"; dbConn: DbConnSql }

export const FlowPuzzleDb = (impl: FlowPuzzleDbImpl): IFlowPuzzleDb => {
  switch (impl.t) {
    case "hash-map": {
      return FlowPuzzleDbHashMap()
    }
    case "postgres": {
      return FlowPuzzleDbPostgres(impl)
    }
  }
}
