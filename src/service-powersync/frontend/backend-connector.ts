import { AbstractPowerSyncDatabase, BaseObserver, PowerSyncBackendConnector } from '@powersync/web'
import { ILogger, Logger } from '~/@/logger'
import { unwrap } from '~/@/result'
import { BackendConnectorRPC } from './backend-connector-rpc'

export class BackendConnector extends BaseObserver<{}> implements PowerSyncBackendConnector {
  private readonly backendUrl: string
  private readonly logger: ILogger

  constructor(config: { powersyncUrl: string; backendUrl: string; logger: ILogger }) {
    super()

    this.backendUrl = config.backendUrl
    this.logger = Logger.prefix('PowerSyncBackendConnector', config.logger)
  }
  async fetchCredentials() {
    try {
      const got = await BackendConnectorRPC.fetchCredentials({
        backendUrl: this.backendUrl,
        logger: this.logger,
      })

      const credentials = unwrap(got)

      return credentials
    } catch (error) {
      this.logger.error('Failed to fetchCredentials:', error)
      throw error
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const crudTransaction = await database.getNextCrudTransaction()

    this.logger.info('crudTransaction', crudTransaction)

    this.logger.error('uploadData not implemented yet', database)
  }
}
