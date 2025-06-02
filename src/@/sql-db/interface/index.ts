import type { s } from '~/@/schema'
import type { Result } from '~/@/result'
import type { Sql } from '~/@/sql'
import { Sub } from '../../sub'

export type DbConnSqlNotification = {
  channel: string
  payload?: string
}

export type DbConnSqlQueryInput<TRow> = {
  schema: s.Schema<TRow>
  sql: string
  vars: Sql.Vars
}

export type SqlDb = {
  query: <TRow>(input: DbConnSqlQueryInput<TRow>) => Promise<Result<string, TRow[]>>
  sub: <TRow>(input: DbConnSqlQueryInput<TRow>) => Sub<TRow[]>
  // execute: (rawSql: string, variables: Sql.Vars) => Promise<Result<string, null>>
  listen: (channel: string, callback: (notification: DbConnSqlNotification) => void) => Promise<() => Promise<void>>
  notify: (channel: string, payload: string) => Promise<Result<string, null>>
  aggregate: {
    StringConcat: (column: string, separator: string) => string
  }
}
