import { PowerSyncBackendConnector, PowerSyncDatabase } from '@powersync/web'
import JsLogger from 'js-logger'
import { ILogger, Logger } from '~/@/logger'
import { Sub } from '~/@/sub'
import { AppSchema } from './powersync-client-schema'

JsLogger.useDefaults()
JsLogger.setLevel(JsLogger.DEBUG)

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
  database: PowerSyncDatabase
  events: Sub<PowerSyncDatabaseEvent>
  start: () => Promise<void>
}

export type PowerSyncClientVariant = 'in-memory' | 'durable'

export const PowerSyncClient = async (input: {
  variant: PowerSyncClientVariant
  debug: boolean
  logger: ILogger
  backendConnector: PowerSyncBackendConnector
}): Promise<IPowerSyncClient> => {
  const logger = Logger.prefix('PowerSyncClient', input.logger)
  const database = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
      dbFilename: input.variant === 'in-memory' ? ':memory:' : 'powersync.db',
      dbLocation: input.variant === 'in-memory' ? 'test' : undefined,
      debugMode: input.debug,
    },
    flags: {
      broadcastLogs: true,
      enableMultiTabs: true,
      ssrMode: false,
      useWebWorker: false,
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
      await database.connect(input.backendConnector)
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
