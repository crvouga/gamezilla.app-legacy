import {
  AbstractPowerSyncDatabase,
  BaseObserver,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from '@powersync/web'
import { ILogger, Logger } from '~/@/logger'
import { unwrap } from '~/@/result'
import { BackendConnectorRPC } from './backend-connector-rpc'

export class BackendConnector extends BaseObserver<{}> implements PowerSyncBackendConnector {
  private readonly backendUrl: string
  private readonly powersyncUrl: string
  private readonly logger: ILogger

  constructor(config: { powersyncUrl: string; backendUrl: string; logger: ILogger }) {
    super()

    this.backendUrl = config.backendUrl
    this.powersyncUrl = config.powersyncUrl
    this.logger = Logger.prefix('PowerSyncBackendConnector', config.logger)
  }
  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    try {
      const got = await BackendConnectorRPC.fetchCredentials({
        backendUrl: this.backendUrl,
        logger: this.logger,
      })

      const credentials = unwrap(got)

      return {
        endpoint: this.powersyncUrl,
        token: credentials.token,
      }
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
