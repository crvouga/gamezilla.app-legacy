import { PowerSyncDatabase } from '@powersync/web'
import Logger from 'js-logger'
import { Connector } from './backend-connector'
import { AppSchema } from './database-schema'
import { PubSub } from '~/@/sub'

Logger.useDefaults()
Logger.setLevel(Logger.DEBUG)

export const newPowerSyncDatabase = async (input?: { dbFilename?: string }) => {
  const powerSyncDatabase = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
      dbFilename: input?.dbFilename ?? 'powersync.db',
    },
    flags: {
      broadcastLogs: true,
      enableMultiTabs: false,
    },
  })

  const powerSyncDatabaseEvents = PubSub.create<PowerSyncDatabaseEvent>()

  return {
    powerSyncDatabase,
    powerSyncDatabaseEvents,
  }
}

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

export const setupNewPowerSyncDatabase = async () => {
  const powerSync = await newPowerSyncDatabase()

  // @ts-expect-error - Expose powerSync to the window for debugging
  window.powerSync = powerSync.powerSyncDatabase

  const connector = new Connector()

  powerSync.powerSyncDatabase.connect(connector).then(() => {
    console.log('PowerSync connected to backend')
  })

  powerSync.powerSyncDatabase.init().then(() => {
    console.log('PowerSync initialized')
  })

  powerSync.powerSyncDatabase.waitForFirstSync().then(() => {
    console.log('PowerSync first sync completed')
  })

  return powerSync
}
