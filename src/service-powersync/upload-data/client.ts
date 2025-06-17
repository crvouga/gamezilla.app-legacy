import { CrudTransaction as PowerSyncCrudTransaction } from '@powersync/common'
import { Err, Ok, Result } from '~/@/result'
import { fromPowerSyncCrudTransaction } from './mapping'
import { ENDPOINT, RequestBody } from './types'

const request = async (input: {
  backendUrl: string
  crudTransaction: PowerSyncCrudTransaction
}): Promise<Result<string, null>> => {
  console.log('uploading data', input)

  try {
    const crudTransaction = fromPowerSyncCrudTransaction(input.crudTransaction)

    const body: RequestBody = { crudTransaction }

    const url = new URL(ENDPOINT, input.backendUrl)

    const uploaded = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
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
