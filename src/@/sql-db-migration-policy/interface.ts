import { ILogger } from '../logger'
import { ISqlDb } from '../sql-db/interface'

/**
 *
 */
export type ISqlDbMigrationPolicy = {
  /**
   * Run the migration policy.
   *
   * @param input - The input to the migration policy.
   * @returns A promise that resolves to void.
   */
  execute: (input: { logger: ILogger; sqlDb: ISqlDb; up: string[]; down: string[] }) => Promise<void>
}
