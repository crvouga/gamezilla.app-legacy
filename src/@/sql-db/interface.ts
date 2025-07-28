import type { Result } from '~/@/result'
import type { s } from '~/@/schema'
import type { Sql } from '~/@/sql'
import { Sub } from '../sub'

export type ISqlDb = {
  query: <TRow>(input: SqlDbQueryInput<TRow>) => Promise<Result<string, TRow[]>>
  sub: <TRow, TMsg>(
    input: SqlDbQueryInput<TRow> & { waitFor?: Promise<unknown> },
    onUpdate: (rows: TRow[]) => TMsg,
  ) => Sub<TMsg>
  listen: (channel: string, callback: (notification: SqlDbNotification) => void) => Promise<() => Promise<void>>
  notify: (channel: string, payload: string) => Promise<Result<string, null>>
  aggregate: {
    StringConcat: (column: string, separator: string) => string
  }
}

export type SqlDbQueryInput<TRow> = {
  schema: s.Schema<TRow>
  sql: string
  vars: Sql.Vars
}

export type SqlDbNotification = {
  channel: string
  payload?: string
}
