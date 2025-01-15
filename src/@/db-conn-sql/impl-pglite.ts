import { PGlite } from '@electric-sql/pglite'
// import { electricSync } from '@electric-sql/pglite-sync'
// import { live } from '@electric-sql/pglite/live'
import { electricSync } from '@electric-sql/pglite-sync'
import { live } from '@electric-sql/pglite/live'
import { p } from '~/@/parser'
import { Err, isOk, Ok } from '~/@/result'
import { Sql } from '~/@/sql'
import { Logger } from '../logger'
import type { ILogger } from '../logger/interface'
import { Sleep } from '../promise/sleep'
import type { IDbConnSql } from './interface'

export type Config = {
  t: 'pglite'
  dataDir: string
  logger: ILogger
  simulateLatency?: Sleep
}

let pg: PGlite

export const DbConnSql = async (config: Config): Promise<IDbConnSql> => {
  const logger = Logger.prefix('postgres', config.logger)

  pg ??= await PGlite.create({
    dataDir: config.dataDir,
    relaxedDurability: true,
    extensions: {
      electric: electricSync(),
      live: live,
    },
  })

  return {
    async subscribe(parser, rawSql, params, onChange) {
      const sql = Sql.to(rawSql, params)

      if (!('live' in pg)) {
        throw new Error('live not implemented')
      }
      if (typeof pg.live !== 'object' || pg.live === null) {
        throw new Error('live not implemented')
      }
      if (!('query' in pg.live)) {
        throw new Error('live query not implemented')
      }
      if (typeof pg.live.query !== 'function') {
        throw new Error('live query not implemented')
      }
      const query = await pg.live.query(sql, [], (res: unknown) => {
        const parsed = p.obj({ rows: p.arr(parser) }).parse(res)
        switch (parsed.t) {
          case 'err': {
            logger.error(`Failed to parse row\nerror=${JSON.stringify(parsed.error, null, 4)}`)
            break
          }
          case 'ok': {
            onChange(parsed.value.rows)
            break
          }
        }
      })

      return {
        initialRows: query?.initialResults?.rows?.flatMap((row: unknown) => {
          const parsed = parser.parse(row)
          return isOk(parsed) ? [parsed.value] : []
        }),
        async refresh() {
          if (typeof query.refresh === 'function') {
            await query.refresh()
          } else {
            throw new Error('refresh not implemented')
          }
        },
        async unsubscribe() {
          if (typeof query.unsubscribe === 'function') {
            await query.unsubscribe()
          } else {
            throw new Error('unsubscribe not implemented')
          }
        },
      }
    },

    async query(rowParser, rawSql, params) {
      const sql = Sql.to(rawSql, params)

      try {
        const start = process.hrtime.bigint()

        await config.simulateLatency?.()

        const results = await pg.query(sql)

        const end = process.hrtime.bigint()

        const durationMs = Number(end - start) / 1e6
        const durationFormatted = `${durationMs.toFixed(2)}ms`
        logger.debug(
          `duration=${durationFormatted}\nsql=\n${cleanSql(rawSql)}\nparams=${JSON.stringify(params, null, 4).slice(
            0,
            500,
          )}`,
        )

        const output: p.Infer<typeof rowParser>[] = []

        for (const row of results.rows) {
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
