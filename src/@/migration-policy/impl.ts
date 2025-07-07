import { Logger } from '../logger'
import { ImplAlwaysRun } from './impl-always-run'
import { ImplDangerouslyWipeOnNewSchema } from './impl-dangerously-wipe-on-new-schema'
import { ImplNeverRun } from './impl-never-run'
import { IMigrationPolicy } from './interface'

export type Config = ImplDangerouslyWipeOnNewSchema.Config | ImplNeverRun.Config | ImplAlwaysRun.Config

export const MigrationPolicy = (config: Config): IMigrationPolicy => {
  const configLogger = 'logger' in config ? config.logger : Logger({ t: 'noop' })
  const logger = configLogger.child(['migration-policy'])
  switch (config.t) {
    case 'never-run':
      return ImplNeverRun.MigrationPolicy({ ...config })
    case 'dangerously-wipe-on-new-schema':
      return ImplDangerouslyWipeOnNewSchema.MigrationPolicy({ ...config, logger })
    case 'always-run':
      return ImplAlwaysRun.MigrationPolicy({ ...config, logger })
  }
}
