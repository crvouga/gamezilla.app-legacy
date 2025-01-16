import { PowerSyncDatabase } from '@powersync/web'
import { Connector } from './backend-connector'
import { AppSchema } from './database-schema'
import Logger from 'js-logger'

// Log messages will be written to the window's console.
Logger.useDefaults()

Logger.setLevel(Logger.DEBUG)

export const powerSync = new PowerSyncDatabase({
  // The schema you defined in the previous step
  schema: AppSchema,

  database: {
    // Filename for the SQLite database — it's important to only instantiate one instance per file.
    dbFilename: 'powersync.db',
    // Optional. Directory where the database file is located.'
    // dbLocation: 'path/to/directory'
  },
})

// @ts-expect-error
window.powerSync = powerSync

const setup = async () => {
  console.log('powersync', 'connecting')

  const connector = new Connector()

  await powerSync.connect(connector)

  console.log('powersync', 'connected')

  const testQuery = async () => {
    try {
      const data = await powerSync.database.getAll('select * from game_flow_puzzle LIMIT 100')
      console.log('Synced data:', data)
    } catch (error) {
      console.error('Failed to testQuery data:', error)
    }
  }
  // @ts-ignore
  window.testQuery = testQuery

  const abortController = new AbortController()

  for await (const update of powerSync.watch('select * from game_flow_puzzle', [], {
    signal: abortController.signal,
  })) {
    console.log('WATCH select * from game_flow_puzzle', update)
  }
}

setup()
