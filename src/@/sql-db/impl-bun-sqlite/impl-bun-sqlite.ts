import { Database } from 'bun:sqlite'
import { Err, isErr, Ok } from '~/@/result'
import type { s } from '~/@/schema'
import { Sql } from '~/@/sql'
import { TimeSpan } from '~/@/time/time-span'
import { deterministicJsonStringify } from '../../json/deterministic-stringify'
import type { ILogger } from '../../logger/interface'
import { Sleep } from '../../promise/sleep'
import { PubSub, Sub } from '../../sub'
import type { ISqlDb } from '../interface'
import { Fs } from './fs'

export type Config = {
  t: 'bun-sqlite'
  fs: Fs
  logger: ILogger
  simulateLatency?: Sleep
}

export const SqlDb = async (config: Config): Promise<ISqlDb> => {
  const logger = config.logger.child(['sqlite'])
  const db = new Database(Fs.toConnectionString(config.fs))
  const events = Sub.create<{ t: 'queried' }>()

  const query: ISqlDb['query'] = async (input) => {
    const sql = Sql.to(input.sql, input.vars)

    try {
      const start = process.hrtime.bigint()

      await config.simulateLatency?.(TimeSpan.milliseconds(100))

      const rows = db.query(sql).all()

      const end = process.hrtime.bigint()

      const durationMs = Number(end - start) / 1e6
      const durationFormatted = `${durationMs.toFixed(2)}ms`
      logger.debug(
        `duration=${durationFormatted}\nsql=\n${cleanSql(input.sql)}\vars=${JSON.stringify(input.vars, null, 4).slice(
          0,
          500,
        )}`,
      )

      const output: s.Infer<typeof input.schema>[] = []

      for (const row of rows) {
        const parsed = input.schema.parse(row)

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
      StringConcat: (column, separator) => `GROUP_CONCAT(${column}, '${separator}')`,
    },

    async notify(channel, _payload) {
      logger.warn(`SQLite does not support NOTIFY/LISTEN natively. Skipping notify for channel=${channel}`)
      return Err('NOTIFY/LISTEN is not supported in SQLite')
    },

    async listen(channel, _callback) {
      logger.warn(`SQLite does not support NOTIFY/LISTEN natively. Skipping listen for channel=${channel}`)
      return async () => {
        logger.warn(`Unlisten operation is not needed for SQLite.`)
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
