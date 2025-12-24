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

/**
 * Error message for when a production database is incorrectly marked as migratable.
 */
const getPostgresNotMigratableError = (context: string): string => {
  return (
    `CRITICAL: Postgres database must NEVER be migratable. It is a production database. ` +
    `Migrations can ONLY run against local-first databases (SQLite, PGLite). ` +
    `If you see this error, ${context} has been incorrectly modified.`
  )
}

/**
 * Error message for when a migration policy is attempted against a non-migratable database.
 */
const getMigrationPolicyNotMigratableError = (policyName: string): string => {
  return (
    `CRITICAL: Attempted to run migration policy "${policyName}" against a non-migratable database. ` +
    `Migrations can ONLY run against local-first databases (SQLite, PGLite). ` +
    `Production databases (Postgres) MUST use 'never-run' policy. ` +
    `Skipping migration to prevent accidental database modifications.`
  )
}

/**
 * Asserts that a database is NOT migratable. Throws an error if it is migratable.
 * Use this for production database implementations (e.g., Postgres) to ensure
 * they can never accidentally be marked as migratable.
 */
export const assertNotMigratable = (db: ISqlDb, context: string): void => {
  if (isMigratableSqlDb(db)) {
    throw new Error(getPostgresNotMigratableError(context))
  }
}

/**
 * Checks if a database is migratable for migration policy execution.
 * If not migratable, logs an error and returns a skipped result.
 * Use this in migration policies to safely handle non-migratable databases.
 */
export const checkMigratableForMigration = (
  db: ISqlDb,
  logger: { error: (message: string) => void },
  policyName: string,
): db is IMigratableSqlDb => {
  if (!isMigratableSqlDb(db)) {
    logger.error(getMigrationPolicyNotMigratableError(policyName))
    return false
  }
  return true
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
