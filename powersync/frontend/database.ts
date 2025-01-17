import { PowerSyncDatabase } from '@powersync/web'
import Logger from 'js-logger'
import { Connector } from './backend-connector'
import { AppSchema } from './database-schema'

Logger.useDefaults()

Logger.setLevel(Logger.DEBUG)

export const newPowersyncDatabase = (input?: { dbFilename?: string }) => {
  return new PowerSyncDatabase({
    // The schema you defined in the previous step
    schema: AppSchema,

    database: {
      // Filename for the SQLite database — it's important to only instantiate one instance per file.
      dbFilename: input?.dbFilename ?? 'powersync.db',
      // Optional. Directory where the database file is located.'
      // dbLocation: 'path/to/directory',
    },
    flags: {
      broadcastLogs: true,
    },
  })
}

export const setup = async () => {
  const powersync = newPowersyncDatabase()

  // await powersync.init()

  // @ts-expect-error
  window.powersync = powersync

  console.log('powersync', 'connecting')

  const connector = new Connector()

  await powersync.connect(connector)

  console.log('powersync', 'connected')

  return powersync
}
