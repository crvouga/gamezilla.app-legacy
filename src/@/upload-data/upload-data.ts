import { ILogger } from '../logger'
import { isErr, Ok, Result } from '../result'
import { CrudTransaction } from './crud-transaction'
import { IUploadData, UploadDataCtx } from './interface'

export const uploadData = async (input: {
  ctx: UploadDataCtx
  logger: ILogger
  crudTransaction: CrudTransaction
  uploadDataRegistry: Iterable<IUploadData>
}): Promise<Result<string, null>> => {
  input.logger.debug('Uploading data', { crudTransaction: input.crudTransaction })

  for (const entry of input.crudTransaction.entries) {
    input.logger.debug('Processing entry', { table: entry.table, id: entry.id, op: entry.op })

    for (const uploadData of input.uploadDataRegistry) {
      if (uploadData.match({ ctx: input.ctx, entry })) {
        input.logger.debug('Found matching upload handler', { table: entry.table })

        const uploaded = await uploadData.upload({
          ctx: input.ctx,
          entry,
        })

        if (isErr(uploaded)) {
          input.logger.error('Failed to upload entry', { error: uploaded, table: entry.table, id: entry.id })

          return uploaded
        }

        input.logger.debug('Successfully uploaded entry', { table: entry.table, id: entry.id })
        break
      }
    }
  }

  input.logger.debug('Successfully uploaded all entries')

  return Ok(null)
}
