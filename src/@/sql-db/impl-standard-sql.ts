import { Err, isErr, Ok, Result } from '~/@/result'
import type { s } from '~/@/schema'
import { Sql } from '~/@/sql'
import { TimeSpan } from '~/@/time/time-span'
import { deterministicJsonStringify } from '../json/deterministic-stringify'
import { ILogger } from '../logger'
import { PubSub, Sub } from '../sub'
import type { ISqlDb, SqlDbNotification } from './interface'

export type ImplStandardSql = {
  t: 'standard-sql'
  query: <TRow>(sql: string, schema: s.Schema<TRow>) => Promise<unknown[]>
  logger: ILogger
  pollInterval?: TimeSpan
  garbageCollectionInterval?: TimeSpan
}

const MAX_QUERY_LENGTH_LOG = 1500
const init = (config: ImplStandardSql): ISqlDb => {
  const logger = config.logger.child(['sql'])

  const eventQueryChanged = Sub.init<string[]>()

  const query = async <TRow>(input: { sql: string; vars: Record<string, any>; schema: s.Schema<TRow> }) => {
    const sql = Sql.to(input.sql, input.vars)

    try {
      const start = Date.now()
      const rows = await config.query<TRow>(sql, input.schema)
      const end = Date.now()
      const durationMs = end - start
      const durationFormatted = `${durationMs.toFixed(2)}ms`

      logger.debug(durationFormatted, sql.slice(0, MAX_QUERY_LENGTH_LOG))
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

  const garbageCollectionInterval = config.garbageCollectionInterval ?? TimeSpan.seconds(10)
  setInterval(() => {
    for (const [queryKey, { sub, cleanUp }] of subsByQuery) {
      if (sub.subscriberCount() === 0) {
        subsByQuery.delete(queryKey)
        cleanUp()
      }
    }
  }, TimeSpan.toMilliseconds(garbageCollectionInterval))

  const listeners = new Map<string, Set<(notification: SqlDbNotification) => void>>()

  return {
    async query(input) {
      const queried = await query(input)

      if (Sql.isMutation(input.sql)) {
        const views = Sql.toViewsMemoized(input.sql)
        eventQueryChanged.pub(views)
      }

      return queried
    },

    sub(input, mapper) {
      const queryKey = deterministicJsonStringify([input.sql, input.vars])

      const sub = subsByQuery.get(queryKey)

      type Row = s.Infer<typeof input.schema>

      if (sub) return Sub.map(sub.sub as Sub<Row[]>, mapper)

      const dependencies = Sql.toViewsMemoized(input.sql)
      const dependenciesSet = new Set(dependencies)

      const subNew = Sub.init<unknown>()
      const inflightQueries = new Map<string, Promise<Result<string, Row[]>>>()
      const pub = async (views: string[]) => {
        if (!views.some((view) => dependenciesSet.has(view))) return

        if (inflightQueries.has(queryKey)) {
          const result = await inflightQueries.get(queryKey)
          if (!result) return
          if (!isErr(result)) subNew.pub(result.value)
          return
        }
        const promise = query(input)
        inflightQueries.set(queryKey, promise)

        const result = await promise
        inflightQueries.delete(queryKey)

        if (!isErr(result)) subNew.pub(result.value)
      }

      const unsub = eventQueryChanged.sub(pub)
      eventQueryChanged.pub(dependencies)

      subsByQuery.set(queryKey, { sub: subNew, cleanUp: unsub })

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
            callback({ channel, payload })
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

export const ImplStandardSql = {
  init,
}
