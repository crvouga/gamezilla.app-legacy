import type { Result } from '~/@/core'
import type { p } from '~/@/parser'
import type { Sql } from '~/@/sql'

export type DbConnSqlNotification = {
  channel: string
  payload?: string
}

export type IDbConnSql = {
  query: <TRow>(parser: p.Parser<TRow>, rawSql: string, variables: Sql.Vars) => Promise<Result<string, TRow[]>>
  listen: (channel: string, callback: (notification: DbConnSqlNotification) => void) => Promise<() => Promise<void>>
  notify: (channel: string, payload: string) => Promise<Result<string, null>>
}
