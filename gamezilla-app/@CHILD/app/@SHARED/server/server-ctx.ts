import { Posix } from "gamezilla-app/@SHARED/core"
import { IDbConnKv } from "./db-conn-kv"
import { IDbConnSql } from "./db-conn-sql/db-conn-sql"
import { Logger } from "./logger"
import { ISMS } from "./sms"

export type ServerCtx = {
  dbConnSql: IDbConnSql
  dbConnKv: IDbConnKv
  now: Posix
  logger: Logger
  sms: ISMS
}
