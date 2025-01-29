import { PowerSyncDatabase } from '@powersync/web'
import { ILogger, Logger } from '~/@/logger'
import { Err, isOk, Ok } from '~/@/result'
import { Sql } from '~/@/sql'
import { PubSub, Sub } from '~/@/sub'
import { DbConnSqlQueryInput, IDbConnSql } from '../interface'
import { PowerSyncDatabaseEvent } from '~/service-powersync/frontend/database'

export type Config = {
  t: 'powersync'
  powerSync: {
    powerSyncDatabase: PowerSyncDatabase
    powerSyncDatabaseEvents: PubSub<PowerSyncDatabaseEvent>
  }
  logger: ILogger
}

export const DbConnSql = (config: Config): IDbConnSql => {
  const logger = Logger.prefix('powersync', config.logger)
  const { powerSyncDatabase, powerSyncDatabaseEvents } = config.powerSync
  const query: IDbConnSql['query'] = async (input) => {
    try {
      const sql = Sql.to(input.sql, input.vars)
      const rows = await powerSyncDatabase.getAll?.(sql)
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

    const unsub = powerSyncDatabaseEvents.sub(async (_event) => {
      const got = await powerSyncDatabase.getAll?.(sql)
      const parsedRows = got.map(input.parser.parse).flatMap((parsed) => (isOk(parsed) ? [parsed.value] : []))
      input.onChange(parsedRows)
    })

    powerSyncDatabase.watchWithCallback(
      sql,
      [],
      {
        onResult(results) {
          const parsedRows =
            results.rows?._array.flatMap((row) => {
              const parsed = input.parser.parse(row)
              if (isOk(parsed)) {
                return [parsed.value]
              }
              console.error('failed to parse row', { row, parsed })
              return []
            }) ?? []
          input.onChange(parsedRows)
        },
      },
      {
        signal: abortController.signal,
      },
    )

    return async () => {
      abortController.abort()
      unsub()
    }
  }

  const activeSubscriptions = new Map<
    string,
    {
      unsubscribe: () => void
      pubSub: PubSub<unknown[]>
      unsubscribeTimeout?: ReturnType<typeof setTimeout>
    }
  >()

  const sub: IDbConnSql['sub'] = <TRow>(input: DbConnSqlQueryInput<TRow>) => {
    const sql = Sql.to(input.sql, input.vars)
    const subscriptionKey = sql
      .replaceAll(/\s+/g, ' ')
      .replaceAll(/\n/g, ' ')
      .replaceAll(/\t/g, ' ')
      .replaceAll(' ', ' ')
      .trim()
    logger.noop(`subscriptionKey=${subscriptionKey}`)

    const activeSubscription = activeSubscriptions.get(subscriptionKey)

    if (activeSubscription) {
      logger.noop('returning active sub')

      clearTimeout(activeSubscription.unsubscribeTimeout)

      return activeSubscription.pubSub as Sub<TRow[]>
    }

    const pubSub = PubSub.create<TRow[]>()
    let lastPublished: TRow[] | null = null

    const unsubscribe = subscribe({
      parser: input.parser,
      sql: input.sql,
      vars: input.vars,
      onChange(rows) {
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
      unsubscribe() {
        unsubscribe.then((unsub) => {
          unsub()
          activeSubscriptions.delete(subscriptionKey)
        })
      },
    })

    return {
      sub(subscriber: (rows: TRow[]) => void) {
        const unsub = pubSub.sub(subscriber)
        return () => {
          const activeSubscription = activeSubscriptions.get(subscriptionKey)
          if (!activeSubscription) {
            unsub()
            return
          }
          activeSubscription.unsubscribeTimeout = setTimeout(() => {
            unsub()
            activeSubscription.unsubscribe()
          }, 1000)
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
      callback({ channel, payload })
    })
    return async () => {
      unsub()
    }
  }

  return {
    aggregate: {
      StringConcat: (column, separator) => `GROUP_CONCAT(${column}, '${separator}')`,
    },
    query,
    sub,
    notify,
    listen,
  }
}
