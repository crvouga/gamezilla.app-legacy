import type { AbstractPowerSyncDatabase, PowerSyncBackendConnector } from '@powersync/common'
import { ILogger, Logger } from '~/@/logger'
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
  const logger = Logger.prefix('PowerSyncClient', config.logger)

  const { PowerSyncDatabase } = await importPowerSyncDatabase(config)

  const database = new PowerSyncDatabase({
    schema,
    database: {
      dbFilename: 'powersync.db',
      debugMode: config.debug,
    },
  })

  const events = Sub.create<PowerSyncDatabaseEvent>()

  database.init().then(() => {
    logger.info('PowerSync initialized')
    events.pub({ t: 'initialized' })
  })

  database.waitForFirstSync().then(() => {
    logger.info('PowerSync first sync completed')
    events.pub({ t: 'first-sync-completed' })
  })

  const start = async () => {
    try {
      logger.info('PowerSync: Starting connection...')
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

const importPowerSyncDatabase = async (config: Config) => {
  switch (config.t) {
    case 'browser': {
      const { PowerSyncDatabase } = await import('@powersync/web')
      return { PowerSyncDatabase }
    }
    case 'node.js': {
      const { PowerSyncDatabase } = await import('@powersync/node')
      return { PowerSyncDatabase }
    }
  }
}
