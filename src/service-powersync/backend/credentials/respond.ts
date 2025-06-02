import { pipe } from '~/@/function/pipe'
import * as SignJWT from '~/@/json-crypto/sign-jwt'
import { isErr } from '~/@/result/result'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { Ctx } from '../ctx'
import { getKeys } from '../keys/keys'

const respond = async (input: { request: Request; ctx: Ctx }) => {
  const keys = await getKeys()
  const powerSyncKey = keys.privateKey
  const maybeSessionId = SessionIdHttp.fromRequest(input.request)

  if (!maybeSessionId) {
    return new Response('No session ID found in the request', { status: 401 })
  }

  const foundUserId = await input.ctx.userSessionDb.findUserIdBySessionId(maybeSessionId)

  if (isErr(foundUserId)) {
    return new Response(
      `Internal Server Error. Errored while finding userID associated with request session ID: ${foundUserId.error}`,
      {
        status: 500,
      },
    )
  }

  const userId = foundUserId.value

  if (!userId) {
    return new Response('No user id found to be associated with the request session ID', { status: 401 })
  }

  if (typeof powerSyncKey?.alg !== 'string') {
    return new Response('Internal Server Error. PowerSync private key algorithm is not a string', { status: 500 })
  }

  const jwt = pipe(
    SignJWT.createJWT(),
    (jwt) =>
      SignJWT.setProtectedHeader(jwt, {
        alg: powerSyncKey?.alg,
        kid: powerSyncKey?.kid,
      }),
    (jwt) => SignJWT.setSubject(jwt, userId),
    (jwt) => SignJWT.setIssuedAt(jwt),
    (jwt) => SignJWT.setIssuer(jwt, ''), // config?.powersync?.jwtIssuer ?? ''
    (jwt) => SignJWT.setAudience(jwt, 'powersync'), // config?.powersync?.url ?? ''
    (jwt) => SignJWT.setExpirationTime(jwt, '5m'),
  )

  const token = await SignJWT.sign(jwt, powerSyncKey?.key)

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

export const PowerSyncCredentials = {
  respond,
}
