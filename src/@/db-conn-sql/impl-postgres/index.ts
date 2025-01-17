import { Err, Ok } from '~/@/result'
import type { p } from '~/@/parser'
import { Sql } from '~/@/sql'
import postgres from 'postgres'
import { Logger } from '../../logger'
import type { ILogger } from '../../logger/interface'
import type { IDbConnSql } from '../interface'
import { Sleep } from '../../promise/sleep'
import { Sub } from '../../sub'

export type Config = {
  t: 'postgres'
  databaseUrl: string
  logger: ILogger
  simulateLatency?: Sleep
}

let postgresClient: postgres.Sql<{}>

export const DbConnSql = async (config: Config): Promise<IDbConnSql> => {
  const logger = Logger.prefix('postgres', config.logger)
  postgresClient ??= postgres(config.databaseUrl)

  return {
    sub() {
      return Sub.None
    },
    async query({ parser, sql: rawSql, vars: variables }) {
      const sql = Sql.to(rawSql, variables)

      try {
        const start = process.hrtime.bigint()

        await config.simulateLatency?.()

        const rows = await postgresClient.unsafe(sql)

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

    async notify(channel, payload) {
      try {
        await postgresClient.notify(channel, payload)
        return Ok(null)
      } catch (error) {
        logger.error(`${error} channel=${channel} payload=${payload}`)
        return Err(String(error))
      }
    },

    async listen(channel, callback) {
      const listening = await postgresClient.listen(channel, (payload) => {
        callback({
          channel: channel,
          payload: payload,
        })
      })

      return async () => {
        await listening.unlisten()
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
