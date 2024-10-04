import type { Result } from 'gamezilla-app/@/core'
import type { p } from 'gamezilla-app/@/core/parser'
import type { Sql } from 'gamezilla-app/@/sql'

export type DbConnSqlNotification = {
  channel: string
  payload?: string
}

export type IDbConnSql = {
  query: <TRow>(parser: p.Parser<TRow>, rawSql: string, variables: Sql.Vars) => Promise<Result<string, TRow[]>>
  listen: (channel: string, callback: (notification: DbConnSqlNotification) => void) => Promise<() => void>
  notify: (channel: string, payload: string) => Promise<Result<string, null>>
}
