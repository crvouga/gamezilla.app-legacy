import { PowerSyncDatabase } from '@powersync/web'
import { p } from '~/@/parser'
import { Err, isOk, Ok } from '~/@/result'
import { Sql } from '~/@/sql'
import { PubSub, Sub } from '~/@/sub'
import { IDbConnSql } from '../interface'
import { ILogger, Logger } from '~/@/logger'

export type Config = {
  t: 'powersync'
  powersync: PowerSyncDatabase
  logger: ILogger
}

export const DbConnSql = (config: Config): IDbConnSql => {
  const logger = Logger.prefix('powersync', config.logger)
  const query: IDbConnSql['query'] = async <TRow>(rowParser: p.Parser<TRow>, rawSql: string, variables: Sql.Vars) => {
    try {
      const sql = Sql.to(rawSql, variables)
      const rows = await config.powersync.getAll?.(sql)
      if (!rows) return Err('No results')
      const parsedRows: TRow[] = rows.map(rowParser.parse).flatMap((parsed) => (isOk(parsed) ? [parsed.value] : []))
      return Ok(parsedRows)
    } catch (error) {
      return Err(String(error))
    }
  }

  const subscribe: IDbConnSql['subscribe'] = async <TRow>(
    parser: p.Parser<TRow>,
    rawSql: string,
    variables: Sql.Vars,
    onChange: (rows: TRow[]) => void,
  ) => {
    const sql = Sql.to(rawSql, variables)

    const abortController = new AbortController()
    const watch = async () => {
      config.powersync.getAll?.(sql).then((rows) => {
        const parsedRows: TRow[] =
          rows?.map(parser.parse).flatMap((parsed) => (isOk(parsed) ? [parsed.value] : [])) ?? []
        onChange(parsedRows)
      })

      for await (const result of config.powersync.watch(sql, [], { signal: abortController.signal })) {
        const parsedRows: TRow[] =
          result.rows?._array.map(parser.parse).flatMap((parsed) => (isOk(parsed) ? [parsed.value] : [])) ?? []
        onChange(parsedRows)
      }
    }
    watch()
    return {
      initialRows: [],
      refresh: async () => {
        abortController.abort()
        watch()
      },
      unsubscribe: async () => {
        abortController.abort()
      },
    }
  }

  const activeSubscriptions = new Map<
    string,
    {
      unsubscribe: () => void
      pubSub: PubSub<unknown[]>
      tableName: string
      primaryKey: string[]
    }
  >()

  const sub: IDbConnSql['sub'] = <TRow>(input: {
    parser: p.Parser<TRow>
    rawSql: string
    variables: Sql.Vars
    tableName: string
    primaryKey: string[]
  }) => {
    const sql = Sql.to(input.rawSql, input.variables)
    const subscriptionKey = sql
    logger.debug(`subscriptionKey=${subscriptionKey}`)

    if (activeSubscriptions.has(subscriptionKey)) {
      logger.debug('returning active sub')
      return activeSubscriptions.get(subscriptionKey)!.pubSub as Sub<TRow[]>
    }

    const pubSub = PubSub.create<TRow[]>()
    let lastPublished: TRow[] | null = null

    const subscribed = subscribe(input.parser, input.rawSql, input.variables, (rows) => {
      if (
        lastPublished &&
        rows.length === lastPublished.length &&
        rows.every((row, idx) => lastPublished && JSON.stringify(row) === JSON.stringify(lastPublished[idx]))
      ) {
        return
      }

      lastPublished = rows
      pubSub.pub(rows)
    })

    activeSubscriptions.set(subscriptionKey, {
      // @ts-ignore
      pubSub: pubSub,
      unsubscribe: async () => {
        const sub = await subscribed
        sub.unsubscribe()
        activeSubscriptions.delete(subscriptionKey)
      },
      primaryKey: input.primaryKey,
      tableName: input.tableName,
    })

    return {
      sub(subscriber: (rows: TRow[]) => void) {
        const unsub = pubSub.sub(subscriber)

        return () => {
          unsub()
          activeSubscriptions.get(subscriptionKey)?.unsubscribe()
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
    subscribe,
    sub,
    notify,
    listen,
  }
}
