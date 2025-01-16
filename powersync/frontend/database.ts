import { PowerSyncDatabase } from '@powersync/web'
import { Connector } from './backend-connector'
import { AppSchema } from './database-schema'

export const powerSyncDatabase = new PowerSyncDatabase({
  // The schema you defined in the previous step
  schema: AppSchema,

  database: {
    // Filename for the SQLite database — it's important to only instantiate one instance per file.
    dbFilename: 'powersync.db',
    // Optional. Directory where the database file is located.'
    // dbLocation: 'path/to/directory'
  },
})

const connector = new Connector()

const setup = async () => {
  console.log('powersync', 'init')

  await powerSyncDatabase.init()

  console.log('powersync', 'initialized')

  console.log('powersync', 'connecting')

  await powerSyncDatabase.connect(connector)

  console.log('powersync', 'connected')

  const testQuery = async () => {
    try {
      const data = await powerSyncDatabase.getAll('select * from game_flow_puzzle limit 10')
      console.log('Synced data:', data)
    } catch (error) {
      console.error('Failed to testQuery data:', error)
    }
  }

  // @ts-ignore
  window.testQuery = testQuery
}

setup()
