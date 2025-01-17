import { Err, Ok } from '~/@/result'
import type { p } from '~/@/parser'
import { Sql } from '~/@/sql'
import { Logger } from '../../logger'
import type { ILogger } from '../../logger/interface'
import type { IDbConnSql } from '../interface'
import { Sleep } from '../../promise/sleep'
import { Sub } from '../../sub'
import { Database } from 'bun:sqlite'
import { BunSqliteFileSystem } from './bun-sqlite-file-system'

export type Config = {
  t: 'bun-sqlite'
  fileSystem: BunSqliteFileSystem
  logger: ILogger
  simulateLatency?: Sleep
}

let db: Database

export const DbConnSql = async (config: Config): Promise<IDbConnSql> => {
  const logger = Logger.prefix('sqlite', config.logger)
  db ??= new Database(BunSqliteFileSystem.toConnectionString(config.fileSystem))

  return {
    sub() {
      return Sub.None
    },

    async query({ parser, sql: rawSql, vars: variables }) {
      const sql = Sql.to(rawSql, variables)

      try {
        const start = process.hrtime.bigint()

        await config.simulateLatency?.()

        const rows = db.query(sql).all()

        const end = process.hrtime.bigint()

        const durationMs = Number(end - start) / 1e6
        const durationFormatted = `${durationMs.toFixed(2)}ms`
        logger.debug(
          `duration=${durationFormatted}\nsql=\n${cleanSql(rawSql)}\nvariables=${JSON.stringify(
            variables,
            null,
            4,
          ).slice(0, 500)}`,
        )

        const output: p.Infer<typeof parser>[] = []

        for (const row of rows) {
          const parsed = parser.parse(row)

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
        return Err(String(error))
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
