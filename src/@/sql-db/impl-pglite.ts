import { Ok } from '~/@/result'
import type { ILogger } from '../logger/interface'
import { IPglite } from '../pglite/types'
import { ImplStandardSql } from './impl-standard-sql'
import type { ISqlDb } from './interface'

export type ImplPglite = {
  t: 'pglite'
  pglite: Promise<IPglite>
  logger: ILogger
}

const init = (config: ImplPglite): ISqlDb => {
  const query = async (rawSql: string): Promise<unknown[]> => {
    const pgliteClient = await config.pglite
    const queried = await pgliteClient.query(rawSql)
    const rows = queried.rows
    return rows
  }

  const impl = ImplStandardSql.init({
    t: 'standard-sql',
    query,
    logger: config.logger,
  })

  return {
    ...impl,
    aggregate: {
      StringConcat: (column, separator) => `STRING_AGG(${column}, '${separator}')`,
    },
    notify: async (channel, payload) => {
      const pgliteClient = await config.pglite
      await pgliteClient.query(`NOTIFY ${channel}, $1`, [payload])
      return Ok(null)
    },
    listen: async (channel, callback) => {
      const pgliteClient = await config.pglite
      const unlisten = await pgliteClient.listen(channel, (payload) => {
        callback({
          channel: channel,
          payload: payload,
        })
      })

      return unlisten
    },
  }
}

export const ImplPglite = {
  init,
}
