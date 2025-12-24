import { ILogger } from '~/@/logger'
import { checkMigratableForMigration, isMigratableSqlDb } from '~/@/sql-db/interface'
import { s } from '~/@/schema'
import { ISqlDbMigrationPolicy } from './interface'

export type ImplAlwaysRun = {
  t: 'always-run'
  logger: ILogger
}

const init = (config: ImplAlwaysRun): ISqlDbMigrationPolicy => {
  const logger = config.logger.child(['always-run'])
  return {
    async execute(input) {
      if (!checkMigratableForMigration(input.sqlDb, logger, 'always-run')) {
        return { t: 'skipped', reason: 'non-migratable-database' }
      }

      // CRITICAL FINAL CHECK: Defense in depth - verify database is still migratable
      // right before executing any SQL. This protects against race conditions or
      // accidental modifications between the initial check and SQL execution.
      if (!isMigratableSqlDb(input.sqlDb)) {
        logger.error(
          `CRITICAL: Database became non-migratable between check and SQL execution in 'always-run' policy. ` +
            `Aborting migration to prevent accidental database modifications. ` +
            `This should never happen - investigate immediately.`,
        )
        return { t: 'skipped', reason: 'non-migratable-database' }
      }

      logger.info('running migration policy', { input })
      logger.warn('EXECUTING MIGRATION SQL - This should only happen with migratable databases (SQLite, PGLite)')

      for (const up of input.up) {
        // Final check before each SQL statement execution
        if (!isMigratableSqlDb(input.sqlDb)) {
          logger.error(
            `CRITICAL: Database became non-migratable during migration execution. ` +
              `Stopping migration execution immediately. SQL that was about to execute: ${up.substring(0, 100)}...`,
          )
          return { t: 'skipped', reason: 'non-migratable-database' }
        }
        await input.sqlDb.query({ sql: up, schema: s.unknown, vars: {} })
      }
      logger.info('migration policy complete', {
        up: input.up,
        down: input.down,
      })
      return { t: 'executed' }
    },
  }
}

export const ImplAlwaysRun = {
  init,
}
