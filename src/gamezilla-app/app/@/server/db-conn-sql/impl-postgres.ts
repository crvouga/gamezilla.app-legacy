import { Err, Ok } from 'gamezilla-app/@/core'
import type { p } from 'gamezilla-app/@/core/parser'
import { Sql } from 'gamezilla-app/@/sql'
import postgres from 'postgres'
import type { ILogger } from '../logger/interface'
import type { IDbConnSql } from './interface'
import { logQuery } from './shared'

export type Config = {
  t: 'postgres'
  databaseUrl: string
  logger: ILogger
  simulateLatency: () => Promise<unknown> | unknown
}

let client: postgres.Sql<{}>

export const DbConnSql = async (config: Config): Promise<IDbConnSql> => {
  client ??= postgres(config.databaseUrl)

  return {
    async query(rowParser, rawSql, params) {
      const sql = Sql.to(rawSql, params)

      try {
        const start = Date.now()

        await config.simulateLatency()

        const rows = await client.unsafe(sql)

        const end = Date.now()

        logQuery({
          logger: config.logger,
          sql: Sql.toLog(rawSql, params),
          start,
          end
        })

        const output: p.Infer<typeof rowParser>[] = []

        for (const row of rows) {
          const parsed = rowParser.parse(row)

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
        config.logger.error(`${error} sql=${sql}`)
        return Err(String(error))
      }
    },

    async notify(channel, payload) {
      try {
        await client.notify(channel, payload)
        return Ok(null)
      } catch (error) {
        config.logger.error(`${error} channel=${channel} payload=${payload}`)
        return Err(String(error))
      }
    },

    async listen(channel, callback) {
      const listening = await client.listen(channel, (payload) => {
        callback({
          channel: channel,
          payload: payload
        })
      })

      return async () => {
        await listening.unlisten()
      }
    }
  }
}
