import { CrudTransaction as PowerSyncCrudTransaction } from '@powersync/web'
import { Err, Ok, Result } from '~/@/result'
import { CrudTransaction } from '~/@/upload-data/crud-transaction'
import { ENDPOINT } from './types'

const fromPowerSyncCrudTransaction = (input: PowerSyncCrudTransaction): CrudTransaction => {
  return {
    entries: input.crud.map((entry) => {
      return {
        id: entry.id,
        type: entry.op,
        newData: entry.opData as Record<string, unknown>,
        prevData: entry.previousValues as Record<string, unknown>,
      }
    }),
  }
}

const request = async (input: { crudTransaction: PowerSyncCrudTransaction }): Promise<Result<string, null>> => {
  console.log('uploading data', input)

  try {
    const body: { crudTransaction: CrudTransaction } = {
      crudTransaction: fromPowerSyncCrudTransaction(input.crudTransaction),
    }
    const uploaded = await fetch(ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })

    if (!uploaded.ok) {
      return Err('Failed to upload data')
    }

    return Ok(null)
  } catch (error) {
    return Err(error as string)
  }
}

export const UploadDataClient = {
  request,
}
