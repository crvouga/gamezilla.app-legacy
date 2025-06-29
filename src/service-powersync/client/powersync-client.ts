import type { AbstractPowerSyncDatabase, PowerSyncBackendConnector } from '@powersync/common'
import { PowerSyncDatabase } from '@powersync/web'
import { ILogger } from '~/@/logger'
import { Sub } from '~/@/sub'
import { schema } from './schema'

export type PowerSyncDatabaseEvent =
  | {
      t: 'connected'
    }
  | {
      t: 'initialized'
    }
  | {
      t: 'first-sync-completed'
    }

export type IPowerSyncClient = {
  database: AbstractPowerSyncDatabase
  events: Sub<PowerSyncDatabaseEvent>
  start: () => Promise<void>
}

export type ConfigBase = {
  debug: boolean
  logger: ILogger
  backendConnector: PowerSyncBackendConnector
}

export type ConfigVariant =
  | {
      t: 'browser'
    }
  | {
      t: 'node.js'
    }

export type Config = ConfigBase & ConfigVariant

export const PowerSyncClient = async (config: Config): Promise<IPowerSyncClient> => {
  const logger = config.logger.child(['PowerSyncClient'])

  const database = new PowerSyncDatabase({
    schema,
    database: {
      dbFilename: 'powersync.db',
      debugMode: config.debug,
    },
  })

  const events = Sub.create<PowerSyncDatabaseEvent>()

  // Initialize the database
  database
    .init()
    .then(() => {
      logger.info('PowerSync initialized')
      events.pub({ t: 'initialized' })
    })
    .catch((error) => {
      logger.error('PowerSync initialization failed:', error)
    })

  database
    .waitForFirstSync()
    .then(() => {
      logger.info('PowerSync first sync completed')
      events.pub({ t: 'first-sync-completed' })
    })
    .catch((error) => {
      logger.error('PowerSync first sync failed:', error)
    })

  const start = async () => {
    try {
      logger.info('PowerSync: Starting connection...')

      // Wait for database to be ready before connecting
      await database.waitForReady()
      logger.info('PowerSync database ready')

      await database.connect(config.backendConnector)
      logger.info('PowerSync connected to backend')
      events.pub({ t: 'connected' })
    } catch (error) {
      logger.error('PowerSync connection failed:', error)
      throw error
    }
  }

  return {
    database,
    events,
    start,
  }
}
