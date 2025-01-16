import { AbstractPowerSyncDatabase, BaseObserver, PowerSyncBackendConnector } from '@powersync/web'
import { unwrap } from '~/@/result'
import { BackendAppRpc } from './backend-app-rpc'

export type PowerSyncConfig = {
  powersyncUrl: string
  backendUrl: string
}

export type PowerSyncConnectorListener = {
  initialized: () => void
}

export class Connector extends BaseObserver<PowerSyncConnectorListener> implements PowerSyncBackendConnector {
  readonly config: PowerSyncConfig

  ready: boolean

  constructor(config: PowerSyncConfig) {
    super()
    this.config = config
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
    const got = await BackendAppRpc.getPowersyncCredentials({
      backendUrl: this.config.backendUrl,
    })

    const credentials = unwrap(got)

    return credentials
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    console.log('uploadData not implemented yet', database)
  }
}
