import postgres from 'postgres'
import { Err, isErr, Ok } from '~/@/result'
import type { s } from '~/@/schema'
import { SecretString } from '~/@/secrets/secret-string'
import { Sql } from '~/@/sql'
import { deterministicJsonStringify } from '../json/deterministic-stringify'
import type { ILogger } from '../logger/interface'
import { Sleep } from '../promise/sleep'
import { PubSub, Sub } from '../sub'
import type { ISqlDb } from './interface'

export type ImplPostgres = {
  t: 'postgres'
  databaseUrl: SecretString
  logger: ILogger
  simulateLatency?: Sleep
}

let postgresClient: postgres.Sql<{}>

const init = (config: ImplPostgres): ISqlDb => {
  const logger = config.logger.child(['postgres'])

  postgresClient ??= postgres(config.databaseUrl.dangerouslyReadValue(), {
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    max: 10,
    connection: {
      application_name: 'gamezilla-app',
    },
    debug: false,
    onnotice(notice) {
      logger.debug({ notice })
    },
    onclose(error) {
      logger.error({ error: error, message: 'onclose' })
    },
  })

  const events = Sub.create<{ t: 'queried' }>()

  const query: ISqlDb['query'] = async (input) => {
    const sql = Sql.to(input.sql, input.vars)

    try {
      const start = process.hrtime.bigint()

      const rows = await postgresClient.unsafe(sql)

      const end = process.hrtime.bigint()

      const durationMs = Number(end - start) / 1e6
      const durationFormatted = `${durationMs.toFixed(2)}ms`

      logger.debug({
        duration: durationFormatted,
        sql: Sql.clean(input.sql),
        variables: Object.entries(input.vars).map(([key, value]) => `${key}=${String(value).slice(0, 100)}`),
      })

      const output: s.Infer<typeof input.schema>[] = []

      for (const row of rows) {
        const parsed = input.schema.parse(row)

        switch (parsed.t) {
          case 'err': {
            const rowStr = JSON.stringify(row, null, 4).slice(0, 1000)
            const errorStr = JSON.stringify(parsed.error, null, 4).slice(0, 1000)
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
      logger.error({ error: error, sql: input.sql, variables: input.vars })
      return Err(`${error} sql=${sql}`)
    }
  }

  const subsByQuery = new Map<string, PubSub<unknown>>()

  return {
    async query(input) {
      const queried = await query(input)
      events.pub({ t: 'queried' })
      return queried
    },
    sub(input, mapper) {
      const queryKey = deterministicJsonStringify({ sql: input.sql, vars: input.vars })

      const sub = subsByQuery.get(queryKey)

      type Row = s.Infer<typeof input.schema>

      if (sub) {
        return Sub.map(sub as Sub<Row[]>, mapper)
      }

      const subNew = Sub.create<unknown>()

      subsByQuery.set(queryKey, subNew)
      const pub = async () => {
        const queried = await query(input)
        if (isErr(queried)) return
        subNew.pub(queried.value)
      }
      events.sub(pub)
      pub()

      return Sub.map(subNew as Sub<Row[]>, mapper)
    },

    aggregate: {
      StringConcat: (column, separator) => `STRING_AGG(${column}, '${separator}')`,
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

export const ImplPostgres = {
  init,
}
