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
  timeouts?: {
    init?: TimeSpan
    firstSync?: TimeSpan
    ready?: TimeSpan
    connect?: TimeSpan
  }
}

export type ConfigVariant =
  | {
      t: 'browser'
    }
  | {
      t: 'node.js'
    }

export type Config = ConfigBase & ConfigVariant

const DEFAULT_TIMEOUTS = {
  init: TimeSpan.seconds(10),
  firstSync: TimeSpan.seconds(10),
  ready: TimeSpan.seconds(10),
  connect: TimeSpan.seconds(10),
}

export const PowerSyncClient = async (config: Config): Promise<IPowerSyncClient> => {
  const logger = config.logger.child(['PowerSyncClient'])

  const timeouts = {
    ...DEFAULT_TIMEOUTS,
    ...config.timeouts,
  }

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
        p.countdown(timeouts.init, () => logger.debug(`Still waiting for PowerSync initialization...`), s),
    })
    if (init.timeout) logger.warn('PowerSync initialization took too long')
    if (init.init) {
      logger.info('PowerSync initialized')
      events.pub({ t: 'initialized' })
    }
  }

  const waitForFirstSync = async () => {
    logger.info('Waiting for first sync...')
    const firstSync = await p.race(null, {
      firstSync: () => database.waitForFirstSync(),
      timeout: (s) =>
        p.countdown(timeouts.firstSync, () => logger.debug(`Still waiting for PowerSync first sync...`), s),
    })
    if (firstSync.timeout) logger.warn('PowerSync first sync took too long')
    if (firstSync.firstSync) {
      logger.info('PowerSync first sync completed')
      events.pub({ t: 'first-sync-completed' })
    }
  }

  const waitForReady = async () => {
    logger.info('Waiting for PowerSync database to be ready...')
    const ready = await p.race(null, {
      ready: () => database.waitForReady(),
      timeout: (s) => p.countdown(timeouts.ready, () => logger.debug(`Still waiting for PowerSync database...`), s),
    })
    if (ready.timeout) logger.warn('PowerSync database took too long to be ready. Continuing anyway...')
    if (ready.ready) logger.info('PowerSync database ready')
  }

  const connect = async () => {
    logger.info('Connecting to backend...')
    const connected = await p.race(null, {
      connect: () => database.connect(config.backendConnector),
      timeout: (s) => p.countdown(timeouts.connect, () => logger.debug(`Still waiting for PowerSync connection...`), s),
    })
    if (connected.timeout) logger.warn('PowerSync connection took too long. Continuing anyway...')
    if (connected.connect) logger.info('PowerSync connected to backend')

    events.pub({ t: 'connected' })
  }

  const start = async () => {
    try {
      await init()
      waitForFirstSync()
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
