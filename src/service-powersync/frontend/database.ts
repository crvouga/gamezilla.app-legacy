import { PowerSyncDatabase } from '@powersync/web'
import Logger from 'js-logger'
import { Sub } from '~/@/sub'
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
}

export const newPowerSyncClient = async (input?: { test?: boolean }): Promise<IPowerSyncClient> => {
  const database = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
      dbFilename: input?.test ? ':memory:' : 'powersync.db',
      dbLocation: input?.test ? 'test' : undefined,
      debugMode: input?.test,
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

  return {
    database,
    events,
  }
}

export const setupNewPowerSyncClient = async () => {
  const powerSync = await newPowerSyncClient()

  // @ts-expect-error - Expose powerSync to the window for debugging
  window.powerSync = powerSync.database

  // const connector = new Connector()

  // powerSync.database.connect(connector).then(() => {
  //   console.log('PowerSync connected to backend')
  //   powerSync.events.pub({ t: 'connected' })
  // })

  return powerSync
}
