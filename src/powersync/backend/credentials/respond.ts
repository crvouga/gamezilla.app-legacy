import { SignJWT } from 'jose'
import { isErr } from '~/@/result/result'
import { SessionIdCookie } from '~/app/wire/transport/session-id-cookie'
import { Ctx } from '../ctx'
import { getKeys } from '../keys/keys'

const respondMain = async (input: { request: Request; ctx: Ctx }) => {
  const keys = await getKeys()
  const powerSyncKey = keys.privateKey
  const maybeSessionId = SessionIdCookie.fromRequest(input.request)

  if (!maybeSessionId) {
    return new Response('No session ID found in the request', { status: 401 })
  }

  const userId = await input.ctx.userSessionDb.findUserIdBySessionId(maybeSessionId)

  if (isErr(userId)) {
    return new Response(
      `Internal Server Error. Errored while finding userID associated with request session ID: ${userId.error}`,
      {
        status: 500,
      },
    )
  }

  if (!userId.value) {
    return new Response('No user id found to be associated with the request session ID', { status: 401 })
  }

  if (typeof powerSyncKey?.alg !== 'string') {
    return new Response('Internal Server Error. PowerSync private key algorithm is not a string', { status: 500 })
  }

  const token = await new SignJWT({})
    .setProtectedHeader({
      alg: powerSyncKey?.alg,
      kid: powerSyncKey?.kid,
    })
    .setSubject(userId.value)
    .setIssuedAt()
    .setIssuer(
      '',
      // config?.powersync?.jwtIssuer ?? ''
    )
    .setAudience(
      'powersync',
      // config?.powersync?.url ?? ''
    )
    .setExpirationTime('5m')
    .sign(powerSyncKey?.key)

  const response = new Response(
    JSON.stringify({
      token: token,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )

  return response
}

const respond = async (input: { request: Request; ctx: Ctx }) => {
  const response = await respondMain(input)
  return allowCORS({ request: input.request, response })
}

const allowCORS = (input: { request: Request; response: Response }) => {
  const origin = input.request.headers.get('Origin')

  if (!origin) {
    return input.response
  }

  input.response.headers.set('Access-Control-Allow-Origin', origin)
  input.response.headers.set('Access-Control-Allow-Credentials', 'true')
  input.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  input.response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (input.request.method !== 'OPTIONS') {
    return input.response
  }

  input.response.headers.set('Access-Control-Max-Age', '3600')
  return new Response(input.response.body, {
    status: 204,
    headers: input.response.headers,
    statusText: 'No Content',
  })
}

export const PowerSyncCredentials = {
  respond,
}
