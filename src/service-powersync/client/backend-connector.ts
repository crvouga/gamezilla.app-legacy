import {
  AbstractPowerSyncDatabase,
  BaseObserver,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from '@powersync/common'
import { ILogger, Logger } from '~/@/logger'
import { isErr, unwrap } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'
import { CredentialsClient } from '../credentials/client'
import { UploadDataClient } from '../upload-data/client'

export class BackendConnector extends BaseObserver<{}> implements PowerSyncBackendConnector {
  private readonly backendUrl: string
  private readonly powersyncUrl: string
  private readonly logger: ILogger
  getGuestUserId: () => Promise<UserId | null>

  constructor(config: {
    powersyncUrl: string
    backendUrl: string
    logger: ILogger
    getGuestUserId: () => Promise<UserId | null>
  }) {
    super()

    this.backendUrl = config.backendUrl
    this.powersyncUrl = config.powersyncUrl
    this.logger = Logger.prefix('PowerSyncBackendConnector', config.logger)
    this.getGuestUserId = config.getGuestUserId
  }
  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    try {
      this.logger.info('BackendConnector: Fetching credentials from', this.backendUrl)
      const guestUserId = await this.getGuestUserId()

      const got = await CredentialsClient.request({
        backendUrl: this.backendUrl,
        logger: this.logger,
        guestUserId,
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

    if (!crudTransaction) {
      this.logger.warn('No crud transaction found, skipping upload')
      return
    }

    this.logger.info('crudTransaction', crudTransaction)

    const uploaded = await UploadDataClient.request({
      crudTransaction,
    })

    if (isErr(uploaded)) {
      this.logger.error('Failed to upload data', uploaded.error)
      return
    }

    this.logger.warn('marking transaction as complete')

    crudTransaction.complete()
  }
}
