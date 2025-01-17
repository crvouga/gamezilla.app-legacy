import type { Result } from '~/@/result'
import type { p } from '~/@/parser'
import type { Sql } from '~/@/sql'
import { Sub } from '../sub'

export type DbConnSqlNotification = {
  channel: string
  payload?: string
}

export type IDbConnSql = {
  query: <TRow>(parser: p.Parser<TRow>, rawSql: string, variables: Sql.Vars) => Promise<Result<string, TRow[]>>
  // execute: (rawSql: string, variables: Sql.Vars) => Promise<Result<string, null>>
  listen: (channel: string, callback: (notification: DbConnSqlNotification) => void) => Promise<() => Promise<void>>
  notify: (channel: string, payload: string) => Promise<Result<string, null>>
  subscribe: <TRow>(
    parser: p.Parser<TRow>,
    rawSql: string,
    variables: Sql.Vars,
    onChange: (rows: TRow[]) => void,
  ) => Promise<{
    initialRows: TRow[]
    unsubscribe: () => Promise<void>
    refresh: () => Promise<void>
  }>
  sub: <TRow>(input: {
    parser: p.Parser<TRow>
    rawSql: string
    variables: Sql.Vars
    tableName: string
    primaryKey: string[]
  }) => Sub<TRow[]>
}
