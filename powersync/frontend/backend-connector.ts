import { AbstractPowerSyncDatabase, BaseObserver, PowerSyncBackendConnector } from '@powersync/web'
import { unwrap } from '~/@/result'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { BackendAppRpc } from './backend-rpc'

export class Connector extends BaseObserver<{}> implements PowerSyncBackendConnector {
  constructor() {
    super()
  }
  async fetchCredentials() {
    try {
      const got = await BackendAppRpc.getPowerSyncCredentials()

      const { token } = unwrap(got)

      return {
        token,
        endpoint: String(CONFIG_FRONTEND.VITE_POWERSYNC_URL),
      }
    } catch (error) {
      console.error('Failed to fetchCredentials:', error)
      throw error
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    console.log('uploadData not implemented yet', database)
  }
}
