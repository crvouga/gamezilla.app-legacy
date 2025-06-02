import { Err, Ok, Result, isErr } from '~/@/result'
import { s } from '~/@/schema'
import type { IDbConnSql } from '../db-conn-sql'
import type { ILogger } from '../logger/interface'
import { withDuration } from '../time/with-duration'
import type { IKeyValueDb } from './interface'
import { Logger } from '../logger'
import { TimeSpan } from '../time/time-span'

const MAX_LEN = 1000

const Row = s.obj({
  id: s.str(),
  value: s.str(),
})

export type Config = {
  t: 'db-conn-sql'
  dbConnSql: IDbConnSql
  logger: ILogger
}

export const KeyValueDb = async (config: Config): Promise<IKeyValueDb> => {
  const logger = Logger.prefix('db-conn-sql', config.logger)
  return {
    async get(key, schema) {
      try {
        const [queried, duration] = await withDuration(() =>
          config.dbConnSql.query({
            schema: Row,
            sql: 'SELECT id, value FROM key_value WHERE id = :id',
            vars: {
              id: key,
            },
          }),
        )
        logger.info(`duration=${TimeSpan.toMilliseconds(duration)}ms get: key=${key}`)

        if (isErr(queried)) {
          return queried
        }

        const row = queried.value[0]

        if (!row) {
          return Ok(null)
        }

        const json = JSON.parse(row.value)

        const parsed = schema.parse(json)

        switch (parsed.t) {
          case 'err': {
            const errorStr = parsed.error.map((e) => e.message).join(', ')

            logger.error(`get: not a value: ${key} ${errorStr.slice(0, MAX_LEN)}`)

            return Err(errorStr)
          }
          case 'ok': {
            return parsed
          }
        }
      } catch (e) {
        const errorStr = `Caught error: get: ${String(e)}`
        logger.error(errorStr.slice(0, MAX_LEN))

        return Err(errorStr)
      }
    },

    async getMany(keys, schema) {
      if (keys.length <= 0) {
        return Ok([])
      }
      try {
        const keysStr = keys.map((key) => `'${key}'`).join(', ')

        const [queried, duration] = await withDuration(() =>
          config.dbConnSql.query({
            schema: Row,
            sql: `SELECT id, value FROM key_value WHERE id IN (${keysStr})`,
            vars: {},
          }),
        )

        logger.info(`duration=${TimeSpan.toMilliseconds(duration)}ms get: keys=${keys.join(', ')}`)

        if (isErr(queried)) {
          return queried
        }

        const rowMap = new Map(queried.value.map((row) => [row.id, row]))

        const rows: s.Infer<typeof schema>[] = []

        for (const key of keys) {
          const row = rowMap.get(key)

          if (!row) {
            continue
          }

          const json = JSON.parse(row.value)

          const parsed = schema.parse(json)

          if (isErr(parsed)) {
            const errorStr = JSON.stringify(parsed.error, null, 2)

            logger.error(`get: not a value: ${row.id} ${errorStr.slice(0, MAX_LEN)}`)

            continue
          }

          rows.push(parsed.value)
        }

        return Ok(rows)
      } catch (e) {
        logger.error(`get: ${keys.join(', ')} ${String(e)}`)
        return Err(String(e))
      }
    },

    async set(key, value) {
      try {
        const queried = await config.dbConnSql.query({
          schema: Row,
          sql: 'INSERT INTO key_value (id, value) VALUES (:id, :value) ON CONFLICT (id) DO UPDATE SET value = :value',
          vars: {
            id: key,
            value: JSON.stringify(value),
          },
        })

        if (isErr(queried)) {
          return queried
        }

        return Ok(null)
      } catch (e) {
        logger.error(`set: ${key} ${String(e).slice(0, MAX_LEN)}`)
        return Err(String(e))
      }
    },

    async setMany(entries) {
      if (entries.length === 0) {
        return Ok(null)
      }

      try {
        const valuesStr = entries.map(([key, value]) => `('${key}', '${JSON.stringify(value)}')`).join(', ')

        const queried = await config.dbConnSql.query({
          schema: Row,
          sql: `INSERT INTO key_value (id, value) VALUES ${valuesStr} ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value`,
          vars: {},
        })

        if (isErr(queried)) {
          return queried
        }

        return Ok(null)
      } catch (e) {
        logger.error(`setMany: ${String(e).slice(0, MAX_LEN)}`)
        return Err(String(e))
      }
    },

    async zap(key) {
      try {
        const queried = await config.dbConnSql.query({
          schema: Row,
          sql: 'DELETE FROM key_value WHERE id = :id',
          vars: {
            id: key,
          },
        })

        return Result.mapOk(queried, () => null)
      } catch (e) {
        logger.error(`zap: ${key} ${String(e).slice(0, MAX_LEN)}`)
        return Err(String(e))
      }
    },
  }
}
