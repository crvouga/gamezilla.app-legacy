export type PowerSyncClientEvent =
  | {
      t: 'connected'
    }
  | {
      t: 'initialized'
    }
  | {
      t: 'first-sync-completed'
    }

const toLog = (event: PowerSyncClientEvent) => {
  switch (event.t) {
    case 'connected':
      return 'PowerSync connected to backend'
    case 'initialized':
      return 'PowerSync initialized'
    case 'first-sync-completed':
      return 'PowerSync first sync completed'
  }
}

const log = (event: PowerSyncClientEvent) => {
  console.log(toLog(event))
}

export const PowerSyncClientEvent = {
  toLog,
  log,
}
