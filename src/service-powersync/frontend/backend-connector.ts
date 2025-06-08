import { AbstractPowerSyncDatabase, BaseObserver, PowerSyncBackendConnector } from '@powersync/web'
import { unwrap } from '~/@/result'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { BackendConnectorRPC } from './backend-connector-rpc'

export class BackendConnector extends BaseObserver<{}> implements PowerSyncBackendConnector {
  constructor() {
    super()
  }
  async fetchCredentials() {
    try {
      const got = await BackendConnectorRPC.fetchCredentials()

      const { token } = unwrap(got)

      return { token, endpoint: String(CONFIG_FRONTEND.VITE_POWERSYNC_URL) }
    } catch (error) {
      console.error('Failed to fetchCredentials:', error)
      throw error
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const crudTransaction = await database.getNextCrudTransaction()

    console.log('crudTransaction', crudTransaction)

    console.error('uploadData not implemented yet', database)
  }
}
