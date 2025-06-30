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

  const init = async () => {
    logger.info('Initializing PowerSync database...')
    const init = await p.race(null, {
      init: () => database.init(),
      timeout: (s) =>
        p.countdown(TimeSpan.seconds(5), () => logger.info(`Still waiting for PowerSync initialization...`), s),
    })
    if (init.timeout) logger.error('PowerSync initialization took too long')
    if (init.init) logger.info('PowerSync initialized')
  }

  const waitForFirstSync = async () => {
    logger.info('Waiting for first sync...')
    const firstSync = await p.race(null, {
      firstSync: () => database.waitForFirstSync(),
      timeout: (s) =>
        p.countdown(TimeSpan.seconds(5), () => logger.info(`Still waiting for PowerSync first sync...`), s),
    })
    if (firstSync.timeout) logger.error('PowerSync first sync took too long')
    if (firstSync.firstSync) logger.info('PowerSync first sync completed')
  }

  const waitForReady = async () => {
    logger.info('Waiting for PowerSync database to be ready...')
    const ready = await p.race(null, {
      ready: () => database.waitForReady(),
      timeout: (s) => p.countdown(TimeSpan.seconds(5), () => logger.info(`Still waiting for PowerSync database...`), s),
    })
    if (ready.timeout) logger.error('PowerSync database took too long to be ready. Continuing anyway...')
    if (ready.ready) logger.info('PowerSync database ready')
  }

  const connect = async () => {
    logger.info('Connecting to backend...')
    const connected = await p.race(null, {
      connect: () => database.connect(config.backendConnector),
      timeout: (s) =>
        p.countdown(TimeSpan.seconds(5), () => logger.info(`Still waiting for PowerSync connection...`), s),
    })
    if (connected.timeout) logger.error('PowerSync connection took too long. Continuing anyway...')
    if (connected.connect) logger.info('PowerSync connected to backend')

    events.pub({ t: 'connected' })
  }

  const start = async () => {
    try {
      await init()
      await waitForFirstSync()
      await waitForReady()
      await connect()
    } catch (error) {
      logger.error('PowerSync connection failed:', error)
    }
  }

  return {
    database,
    events,
    start,
  }
}
