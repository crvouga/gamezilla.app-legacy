import { ILogger } from '~/@/logger'
import { Err, Ok, Result } from '~/@/result'
import { CrudTransaction } from '~/@/sync-engine/crud-transaction/crud-transaction'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { ENDPOINT, RequestBody } from './types'

const push = async (input: {
  backendUrl: string
  clientSessionId: ClientSessionId
  crudTransaction: CrudTransaction
  logger: ILogger
}): Promise<Result<string, null>> => {
  const logger = input.logger.child(['sync-push'])

  try {
    const crudTransaction = input.crudTransaction
    logger.debug(`uploading data`, { crudTransaction })

    const body: RequestBody = { crudTransaction }

    const url = ClientSessionIdHttp.addToUrl(new URL(ENDPOINT, input.backendUrl), input.clientSessionId)

    const uploaded = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (!uploaded.ok) {
      logger.error(`Failed to upload data`, {
        status: uploaded.status,
        statusText: uploaded.statusText,
      })
      return Err(`Failed to upload data: ${uploaded.statusText}`)
    }

    logger.debug(`Successfully uploaded data`)

    return Ok(null)
  } catch (error) {
    const errorMessage = String(error)
    logger.error(`Failed to upload data`, {
      error: errorMessage,
    })
    return Err(errorMessage)
  }
}

export const SyncPushClient = {
  push,
}
