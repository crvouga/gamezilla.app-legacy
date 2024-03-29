import { Err } from "gamezilla-app/@SHARED/core"
import { DbConnSql } from "../db-conn-sql"
import { Logger } from "../logger"
import { IDbConnKv } from "./db-conn-kv"

export const DbConnKvPostgres = async ({
  logger,
}: {
  dbConn: DbConnSql
  logger: Logger
}): Promise<IDbConnKv> => {
  logger.info(`[db-conn-kv-redis] connected`)

  return {
    async get(_key, _parser) {
      return Err("not implemented")
    },

    async set(_key, _value) {
      return Err("not implemented")
    },

    async zap(_key) {
      return Err("not implemented")
    },
  }
}
