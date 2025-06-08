import { PowerSyncDatabase } from '@powersync/web'
import Logger from 'js-logger'
import { Sub } from '~/@/sub'
import { BackendConnector } from '../frontend/backend-connector'
import { AppSchema } from './database-schema'

Logger.useDefaults()
Logger.setLevel(Logger.DEBUG)

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

export const PowerSyncClient = async (input?: {
  variant?: PowerSyncClientVariant
  debug?: boolean
}): Promise<IPowerSyncClient> => {
  const database = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
      dbFilename: input?.variant === 'in-memory' ? ':memory:' : 'powersync.db',
      dbLocation: input?.variant === 'in-memory' ? 'test' : undefined,
      debugMode: input?.debug,
    },
    flags: {
      broadcastLogs: true,
      enableMultiTabs: true,
      ssrMode: false,
      useWebWorker: true,
    },
  })

  const events = Sub.create<PowerSyncDatabaseEvent>()

  database.init().then(() => {
    console.log('PowerSync initialized')
    events.pub({ t: 'initialized' })
  })

  database.waitForFirstSync().then(() => {
    console.log('PowerSync first sync completed')
    events.pub({ t: 'first-sync-completed' })
  })

  const start = async () => {
    const connector = new BackendConnector()
    database.connect(connector).then(() => {
      console.log('PowerSync connected to backend')
      events.pub({ t: 'connected' })
    })
  }

  return {
    database,
    events,
    start,
  }
}
