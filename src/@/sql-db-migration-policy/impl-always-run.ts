import { ILogger } from '~/@/logger'
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
      logger.info('running migration policy', { input })
      for (const up of input.up) {
        await input.sqlDb.query({ sql: up, schema: s.unknown, vars: {} })
      }
      logger.info('migration policy complete', { input })
    },
  }
}

export const ImplAlwaysRun = {
  init,
}
