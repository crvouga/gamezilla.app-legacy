import type { Result } from '~/@/result'
import type { p } from '~/@/parser'
import type { Sql } from '~/@/sql'
import { Sub } from '../sub'

export type DbConnSqlNotification = {
  channel: string
  payload?: string
}

export type DbConnQueryInput<TRow> = {
  parser: p.Parser<TRow>
  sql: string
  vars: Sql.Vars
}

export type IDbConnSql = {
  query: <TRow>(input: DbConnQueryInput<TRow>) => Promise<Result<string, TRow[]>>
  sub: <TRow>(input: DbConnQueryInput<TRow>) => Sub<TRow[]>
  // execute: (rawSql: string, variables: Sql.Vars) => Promise<Result<string, null>>
  listen: (channel: string, callback: (notification: DbConnSqlNotification) => void) => Promise<() => Promise<void>>
  notify: (channel: string, payload: string) => Promise<Result<string, null>>
}
