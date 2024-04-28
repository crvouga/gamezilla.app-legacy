import { IDbConnSql } from "../db-conn-sql"
import { ILogger } from "../logger/logger"
import { IDbConnKv } from "./db-conn-kv"
import { DbConnKvHashMap } from "./db-conn-kv-impl-hash-map"
import { DbConnKvPostgres } from "./db-conn-kv-impl-postgres"
import { DbConnKvRedis } from "./db-conn-kv-impl-redis"

export type Impl =
  | {
      t: "hash-map"
      map?: Map<string, unknown>
    }
  | {
      t: "redis"
      url: string
      logger: ILogger
    }
  | {
      t: "postgres"
      dbConnSql: IDbConnSql
      logger: ILogger
    }

export const DbConnKv = async (impl: Impl): Promise<IDbConnKv> => {
  switch (impl.t) {
    case "hash-map": {
      return DbConnKvHashMap({
        map: impl.map,
      })
    }

    case "redis": {
      return DbConnKvRedis({
        url: impl.url,
        logger: impl.logger,
      })
    }

    case "postgres": {
      return DbConnKvPostgres({
        dbConn: impl.dbConnSql,
        logger: impl.logger,
      })
    }
  }
}
