import { CrudTransaction as PowerSyncCrudTransaction } from '@powersync/common'
import { Err, Ok, Result } from '~/@/result'
import { fromPowerSyncCrudTransaction } from './mapping'
import { ENDPOINT, RequestBody } from './types'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { ClientSessionId } from '~/@/wire/client-session-id'

const request = async (input: {
  backendUrl: string
  clientSessionId: ClientSessionId
  crudTransaction: PowerSyncCrudTransaction
}): Promise<Result<string, null>> => {
  console.log('uploading data', input)

  try {
    const crudTransaction = fromPowerSyncCrudTransaction(input.crudTransaction)

    const body: RequestBody = { crudTransaction }

    const url = ClientSessionIdHttp.addToUrl(new URL(ENDPOINT, input.backendUrl), input.clientSessionId)

    const uploaded = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (!uploaded.ok) {
      return Err('Failed to upload data')
    }

    return Ok(null)
  } catch (error) {
    return Err(String(error))
  }
}

export const PowerSyncUploadDataClient = {
  request,
}
