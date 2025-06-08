import { AbstractPowerSyncDatabase, BaseObserver, PowerSyncBackendConnector } from '@powersync/web'
import { unwrap } from '~/@/result'
import { BackendConnectorRPC } from './backend-connector-rpc'

export class BackendConnector extends BaseObserver<{}> implements PowerSyncBackendConnector {
  private readonly powersyncUrl: string
  private readonly backendUrl: string

  constructor(config: { powersyncUrl: string; backendUrl: string }) {
    super()
    this.powersyncUrl = config.powersyncUrl
    this.backendUrl = config.backendUrl
  }
  async fetchCredentials() {
    try {
      const got = await BackendConnectorRPC.fetchCredentials({ backendUrl: this.backendUrl })

      const { token } = unwrap(got)

      return { token, endpoint: this.powersyncUrl }
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
