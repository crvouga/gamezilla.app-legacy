import { ILogger } from '../logger'
import { Logger } from '../logger'
import { ISqlDb, isMigratableSqlDb } from '../sql-db/interface'

/**
 * Result of executing a migration policy.
 */
export type MigrationPolicyResult =
  | {
      t: 'skipped'
      reason: 'never-run' | 'non-migratable-database' | 'schema-unchanged'
    }
  | {
      t: 'executed'
    }

/**
 * Migration policy interface.
 * All policies accept any ISqlDb, but policies that run migrations will
 * check if the database is migratable and return a skipped result
 * if migrations are attempted against a non-migratable database.
 */
export type ISqlDbMigrationPolicy = {
  /**
   * Run the migration policy.
   *
   * @param input - The input to the migration policy.
   * @returns A promise that resolves to the migration policy result.
   */
  execute: (input: { logger: ILogger; sqlDb: ISqlDb; up: string[]; down: string[] }) => Promise<MigrationPolicyResult>
}

/**
 * Validates that a migration policy is compatible with the given database.
 * This ensures Postgres databases only use never-run policy and migration policies
 * are only used with migratable databases.
 */
export const validatePolicyDatabaseCompatibility = async (
  policy: ISqlDbMigrationPolicy,
  sqlDb: ISqlDb,
  context: string,
): Promise<void> => {
  // Test the policy with empty migrations to determine its behavior
  const testLogger = Logger.init({ t: 'noop' })
  const testResult = await policy.execute({
    logger: testLogger,
    sqlDb,
    up: [],
    down: [],
  })

  const isNeverRun = testResult.t === 'skipped' && testResult.reason === 'never-run'
  const isMigratable = isMigratableSqlDb(sqlDb)

  // Rule 1: Postgres (non-migratable) databases must use never-run policy
  if (!isMigratable && !isNeverRun) {
    throw new Error(
      `CRITICAL: Non-migratable database (Postgres) detected but migration policy is not 'never-run' in ${context}. ` +
        `Postgres databases MUST use 'never-run' policy to prevent accidental migrations. ` +
        `Policy test result: ${JSON.stringify(testResult)}. ` +
        `This is a critical safety violation.`,
    )
  }

  // Rule 2: Migration policies (always-run, dangerously-wipe) can only be used with migratable databases
  if (!isNeverRun && !isMigratable) {
    throw new Error(
      `CRITICAL: Migration policy that runs migrations detected with non-migratable database in ${context}. ` +
        `Only migratable databases (SQLite, PGLite) can use migration policies. ` +
        `Postgres databases MUST use 'never-run' policy. ` +
        `Policy test result: ${JSON.stringify(testResult)}. ` +
        `This is a critical safety violation.`,
    )
  }
}
