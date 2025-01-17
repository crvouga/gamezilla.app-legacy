import { PowerSyncDatabase } from '@powersync/web'
import { ILogger, Logger } from '~/@/logger'
import { Err, isOk, Ok } from '~/@/result'
import { Sql } from '~/@/sql'
import { PubSub, Sub } from '~/@/sub'
import { DbConnSqlQueryInput, IDbConnSql } from '../interface'

export type Config = {
  t: 'powersync'
  powersync: PowerSyncDatabase
  logger: ILogger
}

export const DbConnSql = (config: Config): IDbConnSql => {
  const logger = Logger.prefix('powersync', config.logger)
  const query: IDbConnSql['query'] = async (input) => {
    try {
      const sql = Sql.to(input.sql, input.vars)
      const rows = await config.powersync.getAll?.(sql)
      if (!rows) return Err('No results')
      const parsedRows = rows.map(input.parser.parse).flatMap((parsed) => (isOk(parsed) ? [parsed.value] : []))
      return Ok(parsedRows)
    } catch (error) {
      return Err(String(error))
    }
  }

  const subscribe = async <TRow>(
    input: DbConnSqlQueryInput<TRow> & {
      onChange: (rows: TRow[]) => void
    },
  ) => {
    const sql = Sql.to(input.sql, input.vars)
    const abortController = new AbortController()
    const watch = async () => {
      for await (const result of config.powersync.watch(sql, [], { signal: abortController.signal })) {
        const parsedRows =
          result.rows?._array.map(input.parser.parse).flatMap((parsed) => (isOk(parsed) ? [parsed.value] : [])) ?? []
        input.onChange(parsedRows)
      }
    }
    watch()
    return async () => {
      abortController.abort()
    }
  }

  const activeSubscriptions = new Map<
    string,
    {
      unsubscribe: () => void
      pubSub: PubSub<unknown[]>
    }
  >()

  const sub: IDbConnSql['sub'] = <TRow>(input: DbConnSqlQueryInput<TRow>) => {
    const sql = Sql.to(input.sql, input.vars)
    const subscriptionKey = sql
    logger.debug(`subscriptionKey=${subscriptionKey}`)

    if (activeSubscriptions.has(subscriptionKey)) {
      logger.debug('returning active sub')
      return activeSubscriptions.get(subscriptionKey)!.pubSub as Sub<TRow[]>
    }

    const pubSub = PubSub.create<TRow[]>()
    let lastPublished: TRow[] | null = null

    const unsubscribe = subscribe({
      parser: input.parser,
      sql: input.sql,
      vars: input.vars,
      onChange: (rows) => {
        if (
          lastPublished &&
          rows.length === lastPublished.length &&
          rows.every((row, idx) => lastPublished && JSON.stringify(row) === JSON.stringify(lastPublished[idx]))
        ) {
          return
        }

        lastPublished = rows
        pubSub.pub(rows)
      },
    })

    activeSubscriptions.set(subscriptionKey, {
      pubSub: pubSub as PubSub<unknown[]>,
      unsubscribe: async () => {
        unsubscribe.then((unsub) => unsub())
        activeSubscriptions.delete(subscriptionKey)
      },
    })

    return {
      sub(subscriber: (rows: TRow[]) => void) {
        const unsub = pubSub.sub(subscriber)

        return () => {
          unsub()
          const activeSub = activeSubscriptions.get(subscriptionKey)
          activeSub?.unsubscribe()
          activeSubscriptions.delete(subscriptionKey)
        }
      },
    }
  }

  const channels = new Map<string, PubSub<string>>()
  const notify: IDbConnSql['notify'] = async (channel, payload) => {
    const got = channels.get(channel)
    const chan = got ?? PubSub.create<string>()
    channels.set(channel, chan)
    chan.pub(payload)
    return Ok(null)
  }

  const listen: IDbConnSql['listen'] = async (channel, callback) => {
    const got = channels.get(channel)
    const chan = got ?? PubSub.create<string>()
    channels.set(channel, chan)
    const unsub = chan.sub((payload) => {
      callback({
        channel,
        payload,
      })
    })
    return async () => {
      unsub()
    }
  }

  return {
    query,
    sub,
    notify,
    listen,
  }
}
