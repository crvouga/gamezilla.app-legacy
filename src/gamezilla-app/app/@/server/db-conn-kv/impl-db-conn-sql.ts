import { Err, Ok, Result, isErr } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import type { IDbConnSql } from '../db-conn-sql'
import type { ILogger } from '../logger/interface'
import type { IDbConnKv } from './interface'

const Row = p.obj({
  key: p.str,
  value: p.str
})

export type Config = {
  t: 'db-conn-sql'
  dbConnSql: IDbConnSql
  logger: ILogger
}

export const DbConnKv = async (config: Config): Promise<IDbConnKv> => {
  return {
    async get(key, parser) {
      try {
        const start = process.hrtime.bigint()

        const queried = await config.dbConnSql.query(Row, 'SELECT key, value FROM key_value WHERE key = :key', {
          key: key
        })

        const end = process.hrtime.bigint()

        const durationInMicroseconds = (end - start) / BigInt(1000)

        config.logger.info(`duration=${durationInMicroseconds}µs get: key=${key}`)

        if (isErr(queried)) {
          return queried
        }

        const row = queried.value[0]

        if (!row) {
          return Ok(null)
        }

        const json = JSON.parse(row.value)

        const parsed = parser.parse(json)

        switch (parsed.t) {
          case 'err': {
            const errorStr = JSON.stringify(parsed.error, null, 2)

            config.logger.error(`get: not a value: ${key} ${errorStr}`)

            return Ok(null)
          }
          case 'ok': {
            return parsed
          }
        }
      } catch (e) {
        config.logger.error(`get: ${key} ${String(e)}`)
        return Err(String(e))
      }
    },

    async getMany(keys, parser) {
      if (keys.length <= 0) {
        return Ok([])
      }
      try {
        const start = process.hrtime.bigint()

        const keysStr = keys.map((key) => `'${key}'`).join(', ')

        const queried = await config.dbConnSql.query(
          Row,
          `SELECT key, value FROM key_value WHERE key IN (${keysStr})`,
          {}
        )

        const end = process.hrtime.bigint()

        const durationInMicroseconds = (end - start) / BigInt(1000)

        config.logger.info(`duration=${durationInMicroseconds}µs get: keys=${keys.join(', ')}`)

        if (isErr(queried)) {
          return queried
        }

        const rows: p.Infer<typeof parser>[] = []

        for (const row of queried.value) {
          const json = JSON.parse(row.value)

          const parsed = parser.parse(json)

          if (isErr(parsed)) {
            const errorStr = JSON.stringify(parsed.error, null, 2)

            config.logger.error(`get: not a value: ${row.key} ${errorStr}`)

            continue
          }

          rows.push(parsed.value)
        }

        return Ok(rows)
      } catch (e) {
        config.logger.error(`get: ${keys.join(', ')} ${String(e)}`)
        return Err(String(e))
      }
    },

    async set(key, value) {
      try {
        const queried = await config.dbConnSql.query(
          Row,
          'INSERT INTO key_value (key, value) VALUES (:key, :value) ON CONFLICT (key) DO UPDATE SET value = :value',
          {
            key: key,
            value: JSON.stringify(value)
          }
        )

        if (isErr(queried)) {
          return queried
        }

        return Ok(null)
      } catch (e) {
        config.logger.error(`set: ${key} ${String(e)}`)
        return Err(String(e))
      }
    },

    async setMany(entries) {
      if (entries.length === 0) {
        return Ok(null)
      }

      try {
        const valuesStr = entries.map(([key, value]) => `('${key}', '${JSON.stringify(value)}')`).join(', ')

        const queried = await config.dbConnSql.query(
          Row,
          `INSERT INTO key_value (key, value) VALUES ${valuesStr} ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          {}
        )

        if (isErr(queried)) {
          return queried
        }

        return Ok(null)
      } catch (e) {
        config.logger.error(`setMany: ${String(e)}`)
        return Err(String(e))
      }
    },

    async zap(key) {
      try {
        const queried = await config.dbConnSql.query(Row, 'DELETE FROM key_value WHERE key = :key', {
          key: key
        })

        return Result.mapOk(queried, () => null)
      } catch (e) {
        config.logger.error(`zap: ${key} ${String(e)}`)
        return Err(String(e))
      }
    }
  }
}
