import {
  AbstractPowerSyncDatabase,
  BaseObserver,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from '@powersync/web'
import { ILogger, Logger } from '~/@/logger'
import { unwrap } from '~/@/result'
import { CredentialsFrontend } from '../credentials/client'

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
      this.logger.info('BackendConnector: Fetching credentials from', this.backendUrl)
      const got = await CredentialsFrontend.request({
        backendUrl: this.backendUrl,
        logger: this.logger,
      })

      const credentials = unwrap(got)
      this.logger.info('BackendConnector: Got credentials, token length:', credentials.token.length)

      const result = {
        endpoint: this.powersyncUrl,
        token: credentials.token,
      }

      this.logger.info('BackendConnector: Returning credentials for endpoint:', result.endpoint)
      return result
    } catch (error) {
      this.logger.error('Failed to fetchCredentials:', error)
      throw error
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const crudTransaction = await database.getNextCrudTransaction()

    if (!crudTransaction) return

    this.logger.info('crudTransaction', crudTransaction)

    // const entity = crudTransaction.crud[0]

    this.logger.info('uploadData not implemented yet', database)

    // await new Promise((resolve) => setTimeout(resolve, 2000))

    this.logger.warn('marking transaction as complete but not implemented yet')

    crudTransaction?.complete()
  }
}
