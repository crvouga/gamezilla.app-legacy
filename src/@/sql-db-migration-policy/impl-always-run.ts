import { ILogger } from '~/@/logger'
import { checkMigratableForMigration } from '~/@/sql-db/interface'
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

      logger.info('running migration policy', { input })
      for (const up of input.up) {
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
