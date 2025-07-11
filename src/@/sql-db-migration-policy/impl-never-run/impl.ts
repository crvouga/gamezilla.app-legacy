import { ILogger } from '~/@/logger'
import { ISqlDbMigrationPolicy } from '../interface'

export type Config = {
  t: 'never-run'
  logger: ILogger
}

export const SqlDbMigrationPolicy = (config: Config): ISqlDbMigrationPolicy => {
  return {
    async execute(_input) {
      config.logger.debug('never-run, skipping migration')
    },
  }
}
