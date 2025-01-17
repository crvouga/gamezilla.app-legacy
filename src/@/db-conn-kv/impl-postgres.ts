import { Err, Ok, Result, isErr } from '~/@/result'
import { p } from '~/@/parser'
import type { IDbConnSql } from '../db-conn-sql'
import type { ILogger } from '../logger/interface'
import { withDuration } from '../time/with-duration'
import type { IDbConnKv } from './interface'
import { Logger } from '../logger'
import { TimeSpan } from '../time/time-span'

const Row = p.obj({
  id: p.str,
  value: p.str,
})

export type Config = {
  t: 'postgres'
  dbConnSql: IDbConnSql
  logger: ILogger
}

export const DbConnKv = async (config: Config): Promise<IDbConnKv> => {
  const logger = Logger.prefix('postgres', config.logger)
  return {
    async get(key, parser) {
      try {
        const [queried, duration] = await withDuration(() =>
          config.dbConnSql.query({
            parser: Row,
            rawSql: 'SELECT id, value FROM key_value WHERE id = :id',
            variables: {
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

        const parsed = parser.parse(json)

        switch (parsed.t) {
          case 'err': {
            const errorStr = JSON.stringify(parsed.error, null, 2)

            logger.error(`get: not a value: ${key} ${errorStr}`)

            return Ok(null)
          }
          case 'ok': {
            return parsed
          }
        }
      } catch (e) {
        logger.error(`get: ${key} ${String(e)}`)
        return Err(String(e))
      }
    },

    async getMany(keys, parser) {
      if (keys.length <= 0) {
        return Ok([])
      }
      try {
        const keysStr = keys.map((key) => `'${key}'`).join(', ')

        const [queried, duration] = await withDuration(() =>
          config.dbConnSql.query({
            parser: Row,
            rawSql: `SELECT id, value FROM key_value WHERE id IN (${keysStr})`,
            variables: {},
          }),
        )

        logger.info(`duration=${TimeSpan.toMilliseconds(duration)}ms get: keys=${keys.join(', ')}`)

        if (isErr(queried)) {
          return queried
        }

        const rows: p.Infer<typeof parser>[] = []

        for (const row of queried.value) {
          const json = JSON.parse(row.value)

          const parsed = parser.parse(json)

          if (isErr(parsed)) {
            const errorStr = JSON.stringify(parsed.error, null, 2)

            logger.error(`get: not a value: ${row.id} ${errorStr}`)

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
          parser: Row,
          rawSql:
            'INSERT INTO key_value (id, value) VALUES (:id, :value) ON CONFLICT (id) DO UPDATE SET value = :value',
          variables: {
            id: key,
            value: JSON.stringify(value),
          },
        })

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
      if (entries.length === 0) {
        return Ok(null)
      }

      try {
        const valuesStr = entries.map(([key, value]) => `('${key}', '${JSON.stringify(value)}')`).join(', ')

        const queried = await config.dbConnSql.query({
          parser: Row,
          rawSql: `INSERT INTO key_value (id, value) VALUES ${valuesStr} ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value`,
          variables: {},
        })

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
        const queried = await config.dbConnSql.query({
          parser: Row,
          rawSql: 'DELETE FROM key_value WHERE id = :id',
          variables: {
            id: key,
          },
        })

        return Result.mapOk(queried, () => null)
      } catch (e) {
        logger.error(`zap: ${key} ${String(e)}`)
        return Err(String(e))
      }
    },
  }
}
