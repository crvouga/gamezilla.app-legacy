import { Ok } from '~/@/result'
import { s } from '~/@/schema'
import type { ILogger } from '../logger/interface'
import { IPglite } from '../pglite/types'
import { ImplStandardSql } from './impl-standard-sql'
import type { IMigratableSqlDb } from './interface'

export type ImplPglite = {
  t: 'pglite'
  pglite: Promise<IPglite>
  logger: ILogger
}

const init = (config: ImplPglite): IMigratableSqlDb => {
  const logger = config.logger.child(['pglite'])

  const impl = ImplStandardSql.init({
    t: 'standard-sql',
    async query<TRow>(sql: string, _schema: s.Schema<TRow>) {
      const pgliteClient = await config.pglite
      const queried = await pgliteClient.query(sql)
      const rows = queried.rows
      return rows
    },
    logger,
  })

  return {
    ...impl,
    aggregate: {
      StringConcat: (column, separator) => `STRING_AGG(${column}, '${separator}')`,
    },
    async notify(channel, payload) {
      const pgliteClient = await config.pglite
      await pgliteClient.query(`NOTIFY ${channel}, $1`, [payload])
      return Ok(null)
    },
    async listen(channel, callback) {
      const pgliteClient = await config.pglite
      const unlisten = await pgliteClient.listen(channel, (payload) => {
        callback({
          channel: channel,
          payload: payload,
        })
      })
      return unlisten
    },
    __migratable: Symbol('migratable'),
  }
}

export const ImplPglite = {
  init,
}
