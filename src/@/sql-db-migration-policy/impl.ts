import { Logger } from '../logger'
import { ImplAlwaysRun } from './impl-always-run'
import { ImplDangerouslyWipeOnNewSchema } from './impl-dangerously-wipe-on-new-schema'
import { ImplNeverRun } from './impl-never-run'
import { ISqlDbMigrationPolicy } from './interface'

export type Config = ImplDangerouslyWipeOnNewSchema.Config | ImplNeverRun.Config | ImplAlwaysRun.Config

export const SqlDbMigrationPolicy = (config: Config): ISqlDbMigrationPolicy => {
  const configLogger = 'logger' in config ? config.logger : Logger.init({ t: 'noop' })
  const logger = configLogger.child(['migration-policy'])
  switch (config.t) {
    case 'never-run':
      return ImplNeverRun.SqlDbMigrationPolicy({ ...config })
    case 'dangerously-wipe-on-new-schema':
      return ImplDangerouslyWipeOnNewSchema.SqlDbMigrationPolicy({ ...config, logger })
    case 'always-run':
      return ImplAlwaysRun.SqlDbMigrationPolicy({ ...config, logger })
  }
}
