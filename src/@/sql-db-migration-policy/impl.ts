import { Logger } from '../logger'
import { ImplAlwaysRun } from './impl-always-run'
import { ImplDangerouslyWipeOnNewSchema } from './impl-dangerously-wipe-on-new-schema'
import { ImplNeverRun } from './impl-never-run'
import { ISqlDbMigrationPolicy } from './interface'

export type SqlDbMigrationPolicy = ImplDangerouslyWipeOnNewSchema | ImplNeverRun | ImplAlwaysRun

const init = (config: SqlDbMigrationPolicy): ISqlDbMigrationPolicy => {
  const configLogger = 'logger' in config ? config.logger : Logger.init({ t: 'noop' })
  const logger = configLogger.child(['migration-policy'])
  switch (config.t) {
    case 'never-run': {
      return ImplNeverRun.init({ ...config })
    }
    case 'dangerously-wipe-on-new-schema': {
      return ImplDangerouslyWipeOnNewSchema.init({ ...config, logger })
    }
    case 'always-run': {
      return ImplAlwaysRun.init({ ...config, logger })
    }
  }
}

export const SqlDbMigrationPolicy = {
  init,
}
