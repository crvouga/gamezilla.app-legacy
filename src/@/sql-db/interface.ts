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

/**
 * A branded type that marks a database as safe for automatic migrations.
 * Only local-first databases (SQLite, PGLite) should implement this.
 * Production databases (Postgres) must NEVER implement this.
 */
export type IMigratableSqlDb = ISqlDb & {
  readonly __migratable: symbol
}

/**
 * Type guard to check if a database is migratable.
 * This provides runtime safety in addition to compile-time type checking.
 */
export const isMigratableSqlDb = (db: ISqlDb): db is IMigratableSqlDb => {
  // Check for a marker property that only migratable databases will have
  return '__migratable' in db && typeof (db as any).__migratable === 'symbol'
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
