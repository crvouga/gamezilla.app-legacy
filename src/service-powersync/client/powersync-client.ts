import type { AbstractPowerSyncDatabase, PowerSyncBackendConnector } from '@powersync/common'
import { PowerSyncDatabase } from '@powersync/web'
import { ILogger } from '~/@/logger'
import { Sub } from '~/@/sub'
import { schema } from './schema'
import { p } from '~/@/promise'
import { TimeSpan } from '~/@/time/time-span'

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
      logger.info('Starting connection...')
      const waited = await p.race(null, {
        wait: () => database.waitForReady(),
        timeout: (s) =>
          p.countdown(TimeSpan.seconds(5), () => logger.info(`Still waiting for PowerSync database...`), s),
      })
      if (waited.timeout) logger.error('PowerSync database took too long to be ready. Continuing anyway...')
      if (waited.wait) logger.info('PowerSync database ready')

      logger.info('Connecting to backend...')
      const connected = await p.race(null, {
        connect: () => database.connect(config.backendConnector),
        timeout: (s) =>
          p.countdown(TimeSpan.seconds(5), () => logger.info(`Still waiting for PowerSync connection...`), s),
      })
      if (connected.timeout) logger.error('PowerSync connection took too long. Continuing anyway...')
      if (connected.connect) logger.info('PowerSync connected to backend')

      events.pub({ t: 'connected' })

      return
    } catch (error) {
      logger.error('PowerSync connection failed:', error)
      return
    }
  }

  return {
    database,
    events,
    start,
  }
}
