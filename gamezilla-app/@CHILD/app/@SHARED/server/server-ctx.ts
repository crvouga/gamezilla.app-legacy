import { Posix } from "gamezilla-app/@SHARED/core"
import { DbConnSql } from "./db-conn-sql/db-conn-sql"
import { Logger } from "./logger"

export type ServerCtx = {
  dbConn: DbConnSql
  now: Posix
  logger: Logger
}
