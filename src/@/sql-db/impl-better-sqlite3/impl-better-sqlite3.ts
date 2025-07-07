import * as DatabaseNamespace from 'better-sqlite3'
import { Err, isErr, Ok } from '~/@/result'
import type { s } from '~/@/schema'
import { Sql } from '~/@/sql'
import type { IFileSystem } from '../../file-system/interface'
import { deterministicJsonStringify } from '../../json/deterministic-stringify'
import type { ILogger } from '../../logger/interface'
import { PubSub, Sub } from '../../sub'
import type { ISqlDb } from '../interface'
import { TimeSpan } from '~/@/time/time-span'
const Database = (DatabaseNamespace as any).default || DatabaseNamespace

export type Config = {
  t: 'better-sqlite3'
  databasePath: string
  logger: ILogger
  fs: IFileSystem
  options?: {
    readonly?: boolean
    fileMustExist?: boolean
    timeout?: number
    verbose?: (message?: any, ...additionalArgs: any[]) => void
  }
  pollInterval?: TimeSpan
}

export const SqlDb = async (config: Config): Promise<ISqlDb> => {
  const logger = config.logger.child(['better-sqlite3'])

  // Ensure directory exists if using file-based database
  if (config.databasePath !== ':memory:') {
    const dir = config.databasePath.substring(0, config.databasePath.lastIndexOf('/'))
    const dirExists = await config.fs.exists(dir)
    if (!dirExists) {
      // Create directory by writing a temporary file and then removing it
      const tempPath = `${dir}/.temp`
      await config.fs.write(tempPath, '')
      // Note: We don't have a delete method in IFileSystem, so we'll leave the temp file
      // In a real implementation, you might want to add a delete method to IFileSystem
    }
  }

  const db = new Database(config.databasePath, config.options)

  // Enable WAL mode for better concurrency
  // if (config.databasePath !== ':memory:') {
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA synchronous = NORMAL;')
  db.exec('PRAGMA cache_size = 1000;')
  db.exec('PRAGMA foreign_keys = true;')
  db.exec('PRAGMA temp_store = memory;')
  // }

  const events = Sub.create<{ t: 'queried' }>()

  const query: ISqlDb['query'] = async (input) => {
    const sql = Sql.to(input.sql, input.vars)

    try {
      const start = process.hrtime.bigint()

      // Determine if this is a SELECT query or a write operation
      const trimmedSql = sql.trim().toLowerCase()
      const isSelect = trimmedSql.startsWith('select') || trimmedSql.startsWith('with')

      let rows: any[]

      if (isSelect) {
        const stmt = db.prepare(sql)
        rows = stmt.all()
      } else {
        const stmt = db.prepare(sql)
        stmt.run()
        rows = []

        // For INSERT/UPDATE/DELETE, we might want to return some metadata
        // if (trimmedSql.startsWith('insert') && result.changes > 0) {
        //   rows = [{ lastInsertRowid: result.lastInsertRowid, changes: result.changes }]
        // } else if (result.changes > 0) {
        //   rows = [{ changes: result.changes }]
        // }
      }

      const end = process.hrtime.bigint()

      const durationMs = Number(end - start) / 1e6
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
      events.pub({ t: 'queried' })
      return queried
    },

    sub(input, mapper) {
      const queryKey = deterministicJsonStringify({ sql: input.sql, vars: input.vars })

      const sub = subsByQuery.get(queryKey)

      type Row = s.Infer<typeof input.schema>

      if (sub) {
        return Sub.map(sub.sub as Sub<Row[]>, mapper)
      }

      const subNew = Sub.create<unknown>()
      const pub = async () => {
        const queried = await query(input)
        if (isErr(queried)) return
        subNew.pub(queried.value)
      }

      const cleanUp: (() => void)[] = []

      if (config.pollInterval) {
        const interval = setInterval(pub, TimeSpan.toMilliseconds(config.pollInterval))
        cleanUp.push(() => clearInterval(interval))
      }

      subsByQuery.set(queryKey, { sub: subNew, cleanUp: () => cleanUp.forEach((c) => c()) })
      events.sub(pub)
      pub()
      return Sub.map(subNew as Sub<Row[]>, mapper)
    },

    aggregate: {
      StringConcat: (column, separator) => `GROUP_CONCAT(${column}, '${separator}')`,
    },

    async notify(channel, payload) {
      try {
        // SQLite doesn't have native LISTEN/NOTIFY, so we simulate it
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
      // SQLite doesn't have native LISTEN/NOTIFY, so we simulate it with in-memory listeners
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

const cleanSql = (str: string) =>
  str
    // remove tabs
    .replace(/\t/g, ' ')
    // remove newlines
    .replace(/\n/g, ' ')
    // remove multiple spaces
    .replace(/ +/g, ' ')
