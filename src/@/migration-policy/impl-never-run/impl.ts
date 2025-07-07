import { ILogger } from '~/@/logger'
import { IMigrationPolicy } from '../interface'

export type Config = {
  t: 'never-run'
  logger: ILogger
}

export const MigrationPolicy = (config: Config): IMigrationPolicy => {
  return {
    async execute(_input) {
      config.logger.debug('never-run, skipping migration')
    },
  }
}
