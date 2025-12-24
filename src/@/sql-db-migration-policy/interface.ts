import { ILogger } from '../logger'
import { ISqlDb } from '../sql-db/interface'

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
