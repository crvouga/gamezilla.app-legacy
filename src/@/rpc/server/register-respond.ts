import { IHttpServer } from '~/@/http-server'
import { ILogger } from '~/@/logger'
import { isErr } from '~/@/result'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionId } from '~/@/wire/session-id'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { TraceId } from '~/@/wire/trace-id'
import { Base, Contract, Server } from '../types'

export const registerRespond = <T extends Base>(config: {
  httpServer: IHttpServer
  contract: T
  server: Server<T>
  logger: ILogger
}) => {
  const logger_ = config.logger.child(['rpc'])
  config.httpServer.registerRespond(async (request, _, traceId) => {
    const logger = logger_.child([traceId])
    try {
      logger.debug('Processing RPC request')
      const rpcName = new URL(request.url).searchParams.get('rpc-name')

      if (!rpcName) {
        logger.debug('No RPC name provided')
        return null
      }

      const maybeSessionId = SessionIdHttp.fromRequest(request)
      const sessionId = maybeSessionId ?? SessionId.generate()

      const maybeClientSessionId = ClientSessionIdHttp.fromRequest(request)
      const clientSessionId = maybeClientSessionId ?? ClientSessionId.generate()

      logger.debug('Handling RPC request', { rpcName, sessionId, clientSessionId })
      const response = await handleRequest({
        contract: config.contract,
        server: config.server,
        rpcName,
        request,
        sessionId,
        clientSessionId,
        traceId,
        logger,
      })
      if (!response) {
        logger.debug('No response from handler')
        return null
      }

      if (!maybeSessionId) {
        logger.debug('Setting session cookie')
        response.headers.set('Set-Cookie', SessionIdHttp.toSetCookieHeaderValue({ sessionId, isProd: true }))
      }

      logger.debug('Returning response', { status: response.status })
      return response
    } catch (error) {
      logger.error('Error processing RPC request:', error)
      return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
    }
  })
}

const handleRequest = async (input: {
  contract: Contract<any>
  server: Server<any>
  rpcName: string
  request: Request
  sessionId: SessionId
  clientSessionId: ClientSessionId
  traceId: TraceId
  logger: ILogger
}) => {
  try {
    input.logger.debug('Looking up endpoint config', { rpcName: input.rpcName })
    const endpointConfig = input.contract[input.rpcName]

    if (!endpointConfig) {
      input.logger.debug('Endpoint config not found')
      return null
    }

    const handler = input.server[input.rpcName]

    if (typeof handler !== 'function') {
      input.logger.debug('Handler not found or not a function')
      return null
    }

    input.logger.debug('Parsing request data')

    const requestData = await input.request.json()

    const parsedInput = endpointConfig.input.parse(requestData)

    if (isErr(parsedInput)) {
      input.logger.warn('Invalid request input', { error: parsedInput.error })
      return new Response(JSON.stringify({ error: parsedInput.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    input.logger.debug('Executing handler')
    const outputData = await handler(parsedInput.value, {
      sessionId: input.sessionId,
      clientSessionId: input.clientSessionId,
    })
    const parsedOutput = endpointConfig.output.parse(outputData)

    if (isErr(parsedOutput)) {
      input.logger.error('Invalid handler output', { error: parsedOutput.error })
      return new Response(JSON.stringify({ error: parsedOutput.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    input.logger.debug('Handler completed successfully')
    return new Response(JSON.stringify(parsedOutput.value), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    input.logger.error('Error handling request:', error)
    return new Response(JSON.stringify({ error: String(error) }), { status: 400 })
  }
}
