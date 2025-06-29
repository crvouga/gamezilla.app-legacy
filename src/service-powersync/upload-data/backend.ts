import { ILogger } from '~/@/logger'
import { isErr } from '~/@/result'
import { SyncEngine } from '~/@/sync-engine/impl'
import { SYNC_REGISTRY } from '~/@/sync-engine/sync'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { Ctx } from '../@/backend/ctx'
import { RequestBody } from './types'
import { Json } from '~/@/json/json'

const respond = async (input: { req: Request; ctx: Ctx; logger: ILogger }): Promise<Response | null> => {
  const logger = input.logger.child(['upload-data'])
  logger.info('Received upload data request')
  const body = Json.parse(await input.req.text())
  logger.debug('Request body', { body })

  if (isErr(body)) {
    logger.error('Failed to parse request body', { error: body })
    return new Response(JSON.stringify(body), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const parsed = RequestBody.parse(body.value)

  if (isErr(parsed)) {
    logger.error('Failed to parse request body', { error: parsed })
    return new Response(JSON.stringify(parsed), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  logger.info('Processing crud transaction entries', {
    entryCount: parsed.value.crudTransaction.entries.length,
  })

  const sessionId = SessionIdHttp.fromRequest(input.req)

  if (!sessionId) {
    logger.error('No session id found in request')
    return new Response(JSON.stringify({ error: 'No session id found in request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const clientSessionId = ClientSessionIdHttp.fromRequest(input.req)

  if (!clientSessionId) {
    logger.error('No client session id found in request')
    return new Response(JSON.stringify({ error: 'No client session id found in request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const syncEngine = SyncEngine({
    t: 'backend',
    logger: logger,
    syncRegistry: SYNC_REGISTRY,
  })

  const pushed = await syncEngine.push({
    sessionId,
    clientSessionId,
    crudTransaction: parsed.value.crudTransaction,
  })

  if (isErr(pushed)) {
    logger.error('Failed to upload data', { error: pushed })
    return new Response(JSON.stringify(pushed), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  logger.info('Successfully processed all entries')
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const PowerSyncUploadDataBackend = {
  respond,
}
