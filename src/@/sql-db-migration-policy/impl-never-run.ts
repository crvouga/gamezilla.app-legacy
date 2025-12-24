import { ILogger } from '~/@/logger'
import { ISqlDbMigrationPolicy } from './interface'

export type ImplNeverRun = {
  t: 'never-run'
  logger: ILogger
}

const init = (config: ImplNeverRun): ISqlDbMigrationPolicy => {
  return {
    async execute(_input) {
      config.logger.debug('never-run, skipping migration')
      return { t: 'skipped', reason: 'never-run' }
    },
  }
}

export const ImplNeverRun = {
  init,
}
