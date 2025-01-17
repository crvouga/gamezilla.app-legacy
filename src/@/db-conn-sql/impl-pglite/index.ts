import { electricSync, SyncShapeToTableOptions, SyncShapeToTableResult } from '@electric-sql/pglite-sync'
import { live, LiveNamespace } from '@electric-sql/pglite/live'
import { p } from '~/@/parser'
import { Err, isOk, Ok } from '~/@/result'
import { Sql } from '~/@/sql'
import { PubSub, Sub } from '~/@/sub'
import { Logger } from '../../logger'
import type { ILogger } from '../../logger/interface'
import { Sleep } from '../../promise/sleep'
import type { DbConnQueryInput, IDbConnSql } from '../interface'
import { PGLiteFileSystem } from './pglite-file-system'

export type Config = {
  t: 'pglite'
  fileSystem: PGLiteFileSystem
  logger: ILogger
  simulateLatency?: Sleep
  electricUrl?: string
}

let pg: import('@electric-sql/pglite').PGlite & {
  electric: {
    initMetadataTables: () => Promise<void>
    syncShapeToTable: (options: SyncShapeToTableOptions) => Promise<SyncShapeToTableResult>
  }
  live: LiveNamespace
}

export const DbConnSql = async (config: Config): Promise<IDbConnSql> => {
  const logger = Logger.prefix('pglite', config.logger)
  const electric = electricSync()

  const dataDir = PGLiteFileSystem.toDataDir(config.fileSystem)

  const { PGlite } = await import('@electric-sql/pglite')

  pg ??= await PGlite.create({
    dataDir,
    relaxedDurability: true,
    extensions: {
      electric,
      live,
    },
  })

  const subscribe = async <TRow>(
    input: DbConnQueryInput<TRow> & {
      onChange: (rows: TRow[]) => void
    },
  ) => {
    const sql = Sql.to(input.sql, input.vars)

    logger.debug(`subscribing to sql=${sql}`)

    const query = await pg.live.query(sql, [], (res: unknown) => {
      const parsed = p.obj({ rows: p.arr(input.parser) }).parse(res)
      switch (parsed.t) {
        case 'err': {
          logger.error(`Failed to parse row\nerror=${JSON.stringify(parsed.error, null, 4)}`)
          break
        }
        case 'ok': {
          input.onChange(parsed.value.rows)
          break
        }
      }
    })

    return {
      initialRows: query?.initialResults?.rows?.flatMap((row: unknown) => {
        const parsed = input.parser.parse(row)
        return isOk(parsed) ? [parsed.value] : []
      }),
      async refresh() {
        await query.refresh()
      },
      async unsubscribe() {
        await query.unsubscribe()
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

  return {
    sub<TRow>(input: DbConnQueryInput<TRow>) {
      const sql = Sql.to(input.sql, input.vars)
      const subscriptionKey = sql
      logger.debug(`subscriptionKey=${subscriptionKey}`)

      if (activeSubscriptions.has(subscriptionKey)) {
        logger.debug('returning active sub')
        return activeSubscriptions.get(subscriptionKey)!.pubSub as Sub<TRow[]>
      }

      const pubSub = PubSub.create<TRow[]>()
      let lastPublished: TRow[] | null = null

      const subscribed = subscribe({
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

      // let syncShape: Promise<SyncShapeToTableResult>

      if (config.electricUrl) {
        const electricUrl = new URL(config.electricUrl)
        electricUrl.pathname = `/v1/shape/`
        // electricUrl.searchParams.set('table', input.tableName)
        // syncShape = pg.electric.syncShapeToTable({
        //   table: input.tableName,
        //   primaryKey: input.primaryKey,
        //   shape: {
        //     url: electricUrl.toString(),
        //   },
        // })
      }

      activeSubscriptions.set(subscriptionKey, {
        // @ts-ignore
        pubSub: pubSub,
        unsubscribe: async () => {
          const sub = await subscribed
          sub.unsubscribe()
          activeSubscriptions.delete(subscriptionKey)
          // syncShape.then((result) => {
          //   result.unsubscribe()
          // })
        },
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
    },

    async query(input) {
      const sql = Sql.to(input.sql, input.vars)

      try {
        const start = process.hrtime.bigint()

        await config.simulateLatency?.()

        const results = await pg.query(sql)

        const end = process.hrtime.bigint()

        const durationMs = Number(end - start) / 1e6
        const durationFormatted = `${durationMs.toFixed(2)}ms`
        logger.debug(
          `duration=${durationFormatted}\nsql=\n${cleanSql(input.sql)}\ninput.vars=${JSON.stringify(
            input.vars,
            null,
            4,
          ).slice(0, 500)}`,
        )

        const output: p.Infer<typeof input.parser>[] = []

        for (const row of results.rows) {
          const parsed = input.parser.parse(row)

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
        const query = `NOTIFY ${channel}, '${payload}'`
        await pg.query(query)
        return Ok(null)
      } catch (e) {
        logger.error(`${e} channel=${channel} payload=${payload}`)
        return Err(String(e))
      }
    },

    async listen(channel, callback) {
      const unlisten = await pg.listen(channel, (data) => {
        callback({
          channel,
          payload: data,
        })
      })
      return async () => {
        await unlisten()
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
