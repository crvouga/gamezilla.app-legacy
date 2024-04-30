import { Err, Ok, Result, isErr } from "gamezilla-app/@shared/core"
import { p } from "gamezilla-app/@shared/core/parser"
import { IDbConnSql } from "../db-conn-sql"
import { ILogger } from "../logger/logger"
import { IDbConnKv } from "./db-conn-kv"

const Row = p.obj({
  key: p.str,
  value: p.str,
})

export const DbConnKvPostgres = async ({
  logger,
  dbConn,
}: {
  dbConn: IDbConnSql
  logger: ILogger
}): Promise<IDbConnKv> => {
  return {
    async get(key, parser) {
      try {
        const start = process.hrtime.bigint()

        const queried = await dbConn.query(
          Row,
          "SELECT key, value FROM key_value WHERE key = :key",
          {
            key: key,
          },
        )

        const end = process.hrtime.bigint()

        const durationInMicroseconds = (end - start) / BigInt(1000)

        logger.info(`duration=${durationInMicroseconds}µs get: key=${key}`)

        if (isErr(queried)) {
          return queried
        }

        const row = queried.value[0]

        if (!row) {
          return Ok(null)
        }

        const json = JSON.parse(row.value)

        const parsed = parser.parse(json)

        if (isErr(parsed)) {
          const errorStr = JSON.stringify(parsed.error, null, 2)

          logger.error(`get: not a value: ${key} ${errorStr}`)

          return Ok(null)
        }

        return Ok(parsed.value)
      } catch (e) {
        logger.error(`get: ${key} ${String(e)}`)
        return Err(String(e))
      }
    },

    async getMany(keys, parser) {
      try {
        const start = process.hrtime.bigint()

        const keysStr = keys.map((key) => `'${key}'`).join(", ")

        const queried = await dbConn.query(
          Row,
          `SELECT key, value FROM key_value WHERE key IN (${keysStr})`,
          {},
        )

        const end = process.hrtime.bigint()

        const durationInMicroseconds = (end - start) / BigInt(1000)

        logger.info(
          `duration=${durationInMicroseconds}µs get: keys=${keys.join(", ")}`,
        )

        if (isErr(queried)) {
          return queried
        }

        const rows = queried.value.flatMap((row) => {
          const json = JSON.parse(row.value)

          const parsed = parser.parse(json)

          if (isErr(parsed)) {
            const errorStr = JSON.stringify(parsed.error, null, 2)

            logger.error(`get: not a value: ${row.key} ${errorStr}`)

            return []
          }

          return parsed.value
        })

        return Ok(rows)
      } catch (e) {
        logger.error(`get: ${keys.join(", ")} ${String(e)}`)
        return Err(String(e))
      }
    },

    async set(key, value) {
      try {
        const queried = await dbConn.query(
          Row,
          "INSERT INTO key_value (key, value) VALUES (:key, :value) ON CONFLICT (key) DO UPDATE SET value = :value",
          {
            key: key,
            value: JSON.stringify(value),
          },
        )

        if (isErr(queried)) {
          return queried
        }

        return Ok(null)
      } catch (e) {
        logger.error(`set: ${key} ${String(e)}`)
        return Err(String(e))
      }
    },

    async setMany(entries) {
      try {
        const valuesStr = entries
          .map(([key, value]) => `('${key}', '${JSON.stringify(value)}')`)
          .join(", ")

        const queried = await dbConn.query(
          Row,
          `INSERT INTO key_value (key, value) VALUES ${valuesStr} ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          {},
        )

        if (isErr(queried)) {
          return queried
        }

        return Ok(null)
      } catch (e) {
        logger.error(`setMany: ${String(e)}`)
        return Err(String(e))
      }
    },

    async zap(key) {
      try {
        const queried = await dbConn.query(
          Row,
          "DELETE FROM key_value WHERE key = :key",
          {
            key: key,
          },
        )

        return Result.mapOk(queried, () => null)
      } catch (e) {
        logger.error(`zap: ${key} ${String(e)}`)
        return Err(String(e))
      }
    },
  }
}
