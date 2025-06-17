import { isErr } from '~/@/result'
import { uploadDataRegistry } from '~/@/upload-data/upload-data-registry'
import { Ctx } from '../@/backend/ctx'
import { RequestBody } from './types'

const respond = async (input: { req: Request; ctx: Ctx }): Promise<Response | null> => {
  input.ctx.logger.info('Received upload data request')
  const body = await input.req.json()
  input.ctx.logger.debug('Request body', { body })

  const parsed = RequestBody.parse(body)

  if (isErr(parsed)) {
    input.ctx.logger.error('Failed to parse request body', { error: parsed })
    return new Response(JSON.stringify(parsed), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  input.ctx.logger.info('Processing crud transaction entries', {
    entryCount: parsed.value.crudTransaction.entries.length,
  })

  for (const entry of parsed.value.crudTransaction.entries) {
    input.ctx.logger.debug('Processing entry', {
      table: entry.table,
      id: entry.id,
      op: entry.op,
    })

    for (const uploadData of uploadDataRegistry.values()) {
      if (uploadData.match(entry)) {
        input.ctx.logger.debug('Found matching upload handler', {
          table: entry.table,
          handler: uploadData.constructor.name,
        })

        const uploaded = await uploadData.upload(entry)
        if (isErr(uploaded)) {
          input.ctx.logger.error('Failed to upload entry', {
            error: uploaded,
            table: entry.table,
            id: entry.id,
          })
          return new Response(JSON.stringify(uploaded), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        input.ctx.logger.debug('Successfully uploaded entry', {
          table: entry.table,
          id: entry.id,
        })
        break
      }
    }
  }

  input.ctx.logger.info('Successfully processed all entries')
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const PowerSyncUploadDataBackend = {
  respond,
}
