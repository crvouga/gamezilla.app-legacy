import { PowerSyncDatabase } from '@powersync/web'
import Logger from 'js-logger'
import { Connector } from './backend-connector'
import { AppSchema } from './database-schema'
import { PubSub } from '~/@/sub'

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
  events: PubSub<PowerSyncDatabaseEvent>
}

export const newPowerSyncClient = async (input?: { dbFilename?: string }): Promise<IPowerSyncClient> => {
  const database = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
      dbFilename: input?.dbFilename ?? 'powersync.db',
    },
    flags: {
      broadcastLogs: true,
      enableMultiTabs: false,
    },
  })

  const events = PubSub.create<PowerSyncDatabaseEvent>()

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

  const connector = new Connector()

  powerSync.database.connect(connector).then(() => {
    console.log('PowerSync connected to backend')
    powerSync.events.pub({ t: 'connected' })
  })

  return powerSync
}
