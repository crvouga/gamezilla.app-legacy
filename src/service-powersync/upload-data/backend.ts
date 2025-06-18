import { isErr } from '~/@/result'
import { UploadDataCtx } from '~/@/upload-data/interface'
import { uploadDataRegistry } from '~/@/upload-data/registry'
import { uploadData } from '~/@/upload-data/upload-data'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionIdHttp } from '~/@/wire/session-id-http'
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

  const sessionId = SessionIdHttp.fromRequest(input.req)

  if (!sessionId) {
    input.ctx.logger.error('No session id found in request')
    return new Response(JSON.stringify({ error: 'No session id found in request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const clientSessionId = ClientSessionIdHttp.fromRequest(input.req)

  if (!clientSessionId) {
    input.ctx.logger.error('No client session id found in request')
    return new Response(JSON.stringify({ error: 'No client session id found in request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const ctx: UploadDataCtx = {
    sessionId,
    clientSessionId,
  }

  const uploaded = await uploadData({
    ctx,
    logger: input.ctx.logger,
    crudTransaction: parsed.value.crudTransaction,
    uploadDataRegistry: uploadDataRegistry,
  })

  if (isErr(uploaded)) {
    input.ctx.logger.error('Failed to upload data', { error: uploaded })
    return new Response(JSON.stringify(uploaded), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
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
