import { AbstractPowerSyncDatabase, BaseObserver, PowerSyncBackendConnector } from '@powersync/web'
import { unwrap } from '~/@/result'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { BackendAppRpc } from './backend-rpc'

export class Connector extends BaseObserver<{}> implements PowerSyncBackendConnector {
  constructor() {
    super()
  }

  async fetchCredentials() {
    const got = await BackendAppRpc.getPowersyncCredentials()

    const { token } = unwrap(got)

    return {
      token,
      endpoint: String(CONFIG_FRONTEND.VITE_POWERSYNC_URL),
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    console.log('uploadData not implemented yet', database)
  }
}
