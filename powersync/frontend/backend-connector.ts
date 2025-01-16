import { AbstractPowerSyncDatabase, BaseObserver, PowerSyncBackendConnector } from '@powersync/web'
import { unwrap } from '~/@/result'
import { BackendAppRpc } from './backend-rpc'

export type PowerSyncConfig = {
  powersyncUrl: string
  backendUrl: string
}

export type PowerSyncConnectorListener = {
  initialized: () => void
}

export class Connector extends BaseObserver<PowerSyncConnectorListener> implements PowerSyncBackendConnector {
  readonly config: PowerSyncConfig

  constructor(config: PowerSyncConfig) {
    super()
    this.config = config
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
