import Logger from 'js-logger'
Logger.useDefaults()
Logger.setLevel(Logger.DEBUG)

export const newPowerSyncDatabase = async (input?: { dbFilename?: string }) => {
  const [{ PowerSyncDatabase }, { AppSchema }] = await Promise.all([
    import('@powersync/web'),
    import('./database-schema'),
  ])
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
  const [powersync, { Connector }] = await Promise.all([newPowerSyncDatabase(), import('./backend-connector')])

  // @ts-expect-error
  window.powersync = powersync

  const connector = new Connector()

  await powersync.connect(connector)

  return powersync
}
