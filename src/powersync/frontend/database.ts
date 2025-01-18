import { PowerSyncDatabase } from '@powersync/web'
import Logger from 'js-logger'
import { Connector } from './backend-connector'
import { AppSchema } from './database-schema'

Logger.useDefaults()
Logger.setLevel(Logger.DEBUG)

export const newPowerSyncDatabase = async (input?: { dbFilename?: string }) => {
  return new PowerSyncDatabase({
    schema: AppSchema,
    database: {
      dbFilename: input?.dbFilename ?? 'powersync.db',
    },
    flags: {
      broadcastLogs: true,
      enableMultiTabs: false,
    },
  })
}

export const setupNewPowerSyncDatabase = async () => {
  const powerSync = await newPowerSyncDatabase()

  // @ts-expect-error - Expose powerSync to the window for debugging
  window.powerSync = powerSync

  const connector = new Connector()

  powerSync.connect(connector).then(() => console.log('Connected to PowerSync'))

  return powerSync
}
