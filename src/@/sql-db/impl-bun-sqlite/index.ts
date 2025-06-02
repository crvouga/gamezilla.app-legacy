import { Err, Ok } from '~/@/result'
import type { s } from '~/@/schema'
import { Sql } from '~/@/sql'
import { Logger } from '../../logger'
import type { ILogger } from '../../logger/interface'
import type { SqlDb } from '../interface'
import { Sleep } from '../../promise/sleep'
import { Sub } from '../../sub'
import { Database } from 'bun:sqlite'
import { BunSqliteFileSystem } from './bun-sqlite-file-system'
import { TimeSpan } from '~/@/time/time-span'

export type Config = {
  t: 'bun-sqlite'
  fileSystem: BunSqliteFileSystem
  logger: ILogger
  simulateLatency?: Sleep
}

let db: Database

export const DbConnSql = async (config: Config): Promise<SqlDb> => {
  const logger = Logger.prefix('sqlite', config.logger)
  db ??= new Database(BunSqliteFileSystem.toConnectionString(config.fileSystem))

  return {
    sub() {
      return Sub.none()
    },

    aggregate: {
      StringConcat: (column, separator) => `GROUP_CONCAT(${column}, '${separator}')`,
    },

    async query(input) {
      const sql = Sql.to(input.sql, input.vars)

      try {
        const start = process.hrtime.bigint()

        await config.simulateLatency?.(TimeSpan.milliseconds(100))

        const rows = db.query(sql).all()

        const end = process.hrtime.bigint()

        const durationMs = Number(end - start) / 1e6
        const durationFormatted = `${durationMs.toFixed(2)}ms`
        logger.debug(
          `duration=${durationFormatted}\nsql=\n${cleanSql(input.sql)}\vars=${JSON.stringify(input.vars, null, 4).slice(
            0,
            500,
          )}`,
        )

        const output: s.Infer<typeof input.schema>[] = []

        for (const row of rows) {
          const parsed = input.schema.parse(row)

          switch (parsed.t) {
            case 'err': {
              const rowStr = JSON.stringify(row, null, 4)
              const errorStr = JSON.stringify(parsed.error, null, 4)
              const error = `Failed to parse row\nerror=${errorStr}\nrow=${rowStr}`
              return Err(error)
            }

            case 'ok': {
              output.push(parsed.value)
              break
            }
          }
        }

        return Ok(output)
      } catch (error) {
        logger.error(`${error} sql=${sql}`)
        return Err(`${error} sql=${sql}`)
      }
    },

    async notify(channel, _payload) {
      logger.warn(`SQLite does not support NOTIFY/LISTEN natively. Skipping notify for channel=${channel}`)
      return Err('NOTIFY/LISTEN is not supported in SQLite')
    },

    async listen(channel, _callback) {
      logger.warn(`SQLite does not support NOTIFY/LISTEN natively. Skipping listen for channel=${channel}`)
      return async () => {
        logger.warn(`Unlisten operation is not needed for SQLite.`)
      }
    },
  }
}

const cleanSql = (str: string) =>
  str
    // remove tabs
    .replace(/\t/g, ' ')
    // remove newlines
    .replace(/\n/g, ' ')
    // remove multiple spaces
    .replace(/ +/g, ' ')
