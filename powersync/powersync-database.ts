import { PowerSyncDatabase } from '@powersync/web'
import { Connector } from './Connector'
import { AppSchema } from './Schema'

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
  await connector.init()

  if (!connector.ready) {
    console.error('Connector failed to initialize.')
    return
  }

  await powerSyncDatabase.connect(connector)
  await powerSyncDatabase.init()

  console.log('powersync', 'connected')

  // Test query to verify synchronization
  try {
    const data = await powerSyncDatabase.getAll('select * from game_flow_puzzle limit 10')
    console.log('Synced data:', data)
  } catch (error) {
    console.error('Failed to query data:', error)
  }
}

setup()
