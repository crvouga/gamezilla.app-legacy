import Logger from 'js-logger'
Logger.useDefaults()
Logger.setLevel(Logger.DEBUG)

export const newPowerSyncDatabase = async (input?: { dbFilename?: string }) => {
  const { PowerSyncDatabase } = await import('@powersync/web')
  const { AppSchema } = await import('./database-schema')
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
  const powersync = await newPowerSyncDatabase()

  // @ts-expect-error
  window.powersync = powersync

  console.log('powersync', 'connecting')

  const { Connector } = await import('./backend-connector')

  const connector = new Connector()

  await powersync.connect(connector)

  console.log('powersync', 'connected')

  return powersync
}
