import { Err, isErr, Ok } from '~/@/result'
import type { s } from '~/@/schema'
import { Sql } from '~/@/sql'
import { TimeSpan } from '~/@/time/time-span'
import { deterministicJsonStringify } from '../json/deterministic-stringify'
import { ILogger } from '../logger'
import { PubSub, Sub } from '../sub'
import type { ISqlDb } from './interface'

export type ImplStandardSql = {
  t: 'standard-sql'
  query: (rawSql: string) => Promise<unknown[]>
  logger: ILogger
  pollInterval?: TimeSpan
}

const init = (config: ImplStandardSql): ISqlDb => {
  const logger = config.logger.child(['sql'])

  const eventQueryChanged = Sub.throttle(Sub.init<true>(), TimeSpan.seconds(1))

  const query = async <TRow>(input: { sql: string; vars: Record<string, any>; schema: s.Schema<TRow> }) => {
    const sql = Sql.to(input.sql, input.vars)

    try {
      const start = Date.now()

      const rows = await config.query(sql)

      const end = Date.now()
      const durationMs = end - start
      const durationFormatted = `${durationMs.toFixed(2)}ms`

      logger.debug({
        duration: durationFormatted,
        sql: cleanSql(input.sql),
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

  const subsByQuery = new Map<string, { sub: PubSub<unknown>; cleanUp: () => void }>()
  const listeners = new Map<string, Set<(notification: any) => void>>()

  return {
    async query(input) {
      const queried = await query(input)

      if (Sql.isMutation(input.sql)) {
        eventQueryChanged.pub(true)
      }

      return queried
    },

    sub(input, mapper) {
      const queryKey = deterministicJsonStringify({ sql: input.sql, vars: input.vars })

      const sub = subsByQuery.get(queryKey)

      type Row = s.Infer<typeof input.schema>

      if (sub) {
        return Sub.map(sub.sub as Sub<Row[]>, mapper)
      }

      const subNew = Sub.init<unknown>()
      const pub = async () => {
        const queried = await query(input)
        if (isErr(queried)) return
        subNew.pub(queried.value)
      }

      subsByQuery.set(queryKey, {
        sub: subNew,
        cleanUp: () => {},
      })

      eventQueryChanged.sub(pub)

      eventQueryChanged.pub(true)

      return Sub.map(subNew as Sub<Row[]>, mapper)
    },

    aggregate: {
      StringConcat: (column, separator) => `GROUP_CONCAT(${column}, '${separator}')`,
    },

    async notify(channel, payload) {
      try {
        const channelListeners = listeners.get(channel)
        if (channelListeners) {
          for (const callback of channelListeners) {
            callback({
              channel,
              payload,
            })
          }
        }
        return Ok(null)
      } catch (error) {
        logger.error(`${error} channel=${channel} payload=${payload}`)
        return Err(String(error))
      }
    },

    async listen(channel, callback) {
      let channelListeners = listeners.get(channel)
      if (!channelListeners) {
        channelListeners = new Set()
        listeners.set(channel, channelListeners)
      }

      channelListeners.add(callback)

      return async () => {
        const channelListeners = listeners.get(channel)
        if (channelListeners) {
          channelListeners.delete(callback)
          if (channelListeners.size === 0) {
            listeners.delete(channel)
          }
        }
      }
    },
  }
}

const cleanSql = (str: string) => str.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/ +/g, ' ')

export const ImplStandardSql = {
  init,
}
