import { Posix } from "gamezilla-app/@SHARED/core"
import { DbConnKv } from "./db-conn-kv"
import { DbConnSql } from "./db-conn-sql/db-conn-sql"
import { Logger } from "./logger"

export type ServerCtx = {
  dbConnSql: DbConnSql
  dbConnKv: DbConnKv
  now: Posix
  logger: Logger
}
