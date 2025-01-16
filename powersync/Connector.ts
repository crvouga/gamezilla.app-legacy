import { AbstractPowerSyncDatabase, BaseObserver, PowerSyncBackendConnector } from '@powersync/web'

export type PowerSyncConfig = {
  powersyncUrl: string
}

export type PowerSyncConnectorListener = {
  initialized: () => void
}

export class Connector extends BaseObserver<PowerSyncConnectorListener> implements PowerSyncBackendConnector {
  readonly config: PowerSyncConfig

  ready: boolean

  constructor() {
    super()
    const powersyncUrl = import.meta.env.VITE_POWERSYNC_URL
    if (!powersyncUrl) {
      throw new Error('Missing VITE_POWERSYNC_URL')
    }
    this.config = {
      powersyncUrl,
    }

    this.ready = false
  }

  async init() {
    if (this.ready) {
      return
    }
    this.ready = true
    this.iterateListeners((cb) => cb.initialized?.())
  }

  async fetchCredentials() {
    console.log('fetchCredentials', this.config.powersyncUrl)
    return {
      endpoint: this.config.powersyncUrl,
      token: '', // No authentication required
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    console.log('uploadData not implemented yet', database)
  }
}
