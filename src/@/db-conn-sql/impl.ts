import * as ImplNoop from './impl-noop'

export const DbConnSqlNoop = ImplNoop.DbConnSql({ t: 'noop' })
