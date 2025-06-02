import postgres from 'postgres'
import type { s } from '~/@/schema'
import { Err, Ok } from '~/@/result'
import { SecretString } from '~/@/secrets/secret-string'
import { Sql } from '~/@/sql'
import { Logger } from '../../logger'
import type { ILogger } from '../../logger/interface'
import { Sleep } from '../../promise/sleep'
import { Sub } from '../../sub'
import type { ISqlDb } from '../interface'
import { TimeSpan } from '~/@/time/time-span'

export type Config = {
  t: 'postgres'
  databaseUrl: SecretString
  logger: ILogger
  simulateLatency?: Sleep
}

let postgresClient: postgres.Sql<{}>

export const DbConnSql = async (config: Config): Promise<ISqlDb> => {
  const logger = Logger.prefix('postgres', config.logger)
  postgresClient ??= postgres(config.databaseUrl.dangerouslyReadValue())

  return {
    sub() {
      return Sub.none()
    },
    aggregate: {
      StringConcat: (column, separator) => `STRING_AGG(${column}, '${separator}')`,
    },
    async query({ schema, sql: rawSql, vars: variables }) {
      const sql = Sql.to(rawSql, variables)

      try {
        const start = process.hrtime.bigint()

        await config.simulateLatency?.(TimeSpan.milliseconds(100))

        const rows = await postgresClient.unsafe(sql)

        const end = process.hrtime.bigint()

        const durationMs = Number(end - start) / 1e6
        const durationFormatted = `${durationMs.toFixed(2)}ms`

        logger.debug({ duration: durationFormatted, sql: cleanSql(rawSql), variables: variables })

        const output: s.Infer<typeof schema>[] = []

        for (const row of rows) {
          const parsed = schema.parse(row)

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
        logger.error({ error: error, sql: sql, variables: variables })
        return Err(`${error} sql=${sql}`)
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
