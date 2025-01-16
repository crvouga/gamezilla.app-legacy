import { PowerSyncDatabase } from '@powersync/web'
import { Connector } from './backend-connector'
import { AppSchema } from './database-schema'
import { CONFIG_FRONTEND } from '~/config/frontend'

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

if (typeof CONFIG_FRONTEND.VITE_BACKEND_URL !== 'string') {
  throw new Error('VITE_BACKEND_URL is not a string')
}

if (typeof CONFIG_FRONTEND.VITE_POWERSYNC_URL !== 'string') {
  throw new Error('VITE_POWERSYNC_URL is not a string')
}

const connector = new Connector({
  backendUrl: CONFIG_FRONTEND.VITE_BACKEND_URL,
  powersyncUrl: CONFIG_FRONTEND.VITE_POWERSYNC_URL,
})

const setup = async () => {
  await connector.init()

  if (!connector.ready) {
    console.error('Connector failed to initialize.')
    return
  }

  await powerSyncDatabase.connect(connector)

  await powerSyncDatabase.init()

  console.log('powersync', 'connected')

  try {
    const data = await powerSyncDatabase.getAll('select * from game_flow_puzzle limit 10')
    console.log('Synced data:', data)
  } catch (error) {
    console.error('Failed to query data:', error)
  }
}

setup()
