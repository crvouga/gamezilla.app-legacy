import type { Result } from '~/@/result'
import type { s } from '~/@/schema'
import type { Sql } from '~/@/sql'
import { Logger } from '../logger'
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

/**
 * Validates that a production database URL is not pointing to localhost.
 * This is a safety check to catch misconfigurations.
 */
export const validateProductionDatabaseUrl = (
  databaseUrl: { dangerouslyReadValue: () => string },
  context: string,
): void => {
  const url = databaseUrl.dangerouslyReadValue()
  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1') || url.includes('::1')

  if (isLocalhost) {
    // This is a warning, not an error, as localhost might be valid in some production setups
    // But we log it as a critical warning for visibility
    console.warn(
      `WARNING: Production database URL appears to point to localhost in ${context}. ` +
        `This may indicate a misconfiguration. URL pattern detected: ${url.substring(0, 50)}...`,
    )
  }
}

/**
 * Validates database configuration to ensure migrations never run against non-migratable databases.
 * This is a comprehensive check that validates safety conditions.
 */
export const validateProductionDatabaseConfig = async (
  sqlDb: ISqlDb,
  migrationPolicy: {
    execute: (input: {
      logger: any
      sqlDb: ISqlDb
      up: string[]
      down: string[]
    }) => Promise<{ t: string; reason?: string }>
  },
  context: string,
): Promise<void> => {
  // CRITICAL: If database is not migratable (e.g., Postgres), ensure policy is never-run
  // This check always runs regardless of environment to prevent accidental migrations
  if (!isMigratableSqlDb(sqlDb)) {
    const testLogger = Logger.init({ t: 'noop' })
    const testResult = await migrationPolicy.execute({
      logger: testLogger,
      sqlDb,
      up: [],
      down: [],
    })

    if (testResult.t !== 'skipped' || testResult.reason !== 'never-run') {
      throw new Error(
        `CRITICAL: Non-migratable database (Postgres) detected but migration policy is not 'never-run' in ${context}. ` +
          `Non-migratable databases MUST use 'never-run' policy. ` +
          `Policy returned: ${JSON.stringify(testResult)}. ` +
          `This is a critical safety violation that could lead to accidental migrations running against production.`,
      )
    }
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
