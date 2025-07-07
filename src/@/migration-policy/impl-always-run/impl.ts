import { ILogger } from '~/@/logger'
import { s } from '~/@/schema'
import { IMigrationPolicy } from '../interface'

export type Config = {
  t: 'always-run'
  logger: ILogger
}

export const MigrationPolicy = (config: Config): IMigrationPolicy => {
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
