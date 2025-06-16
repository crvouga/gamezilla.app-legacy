import {
  AbstractPowerSyncDatabase,
  BaseObserver,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from '@powersync/web'
import { ILogger, Logger } from '~/@/logger'

export class BackendConnectorNoop extends BaseObserver<{}> implements PowerSyncBackendConnector {
  private readonly logger: ILogger

  constructor(config: { logger: ILogger }) {
    super()
    this.logger = Logger.prefix('PowerSyncBackendConnectorNoop', config.logger)
  }

  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    this.logger.info('Noop: fetchCredentials')
    return {
      endpoint: 'http://localhost:8080',
      token: 'noop-token',
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const crudTransaction = await database.getNextCrudTransaction()
    if (!crudTransaction) return
    this.logger.info('Noop: uploadData', crudTransaction)
    crudTransaction.complete()
  }
}
