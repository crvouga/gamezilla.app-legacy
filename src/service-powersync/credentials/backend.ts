import { pipe } from '~/@/function/pipe'
import * as SignJWT from '~/@/json-crypto/sign-jwt'
import { isErr } from '~/@/result/result'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { CONFIG_SHARED } from '~/config/shared'
import { CredentialsResponseBodyOk } from '~/service-powersync/credentials/types'
import { getKeyPair } from '../@/backend/keys/keys'
import { Ctx } from '../@/backend/ctx'

const respond = async (input: { request: Request; ctx: Ctx }) => {
  const keys = await getKeyPair()
  if (isErr(keys)) {
    return new Response(
      JSON.stringify({
        message: `Internal Server Error. Errored while getting keys: ${keys.error}`,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const powerSyncKey = keys.value.privateKey
  const maybeSessionId = SessionIdHttp.fromRequest(input.request)

  if (!maybeSessionId) {
    return new Response(
      JSON.stringify({
        message: 'No session ID found in the request',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const foundUserId = await input.ctx.userSessionDb.findUserIdBySessionId(maybeSessionId)

  if (isErr(foundUserId)) {
    return new Response(
      JSON.stringify({
        message: `Internal Server Error. Errored while finding userID associated with request session ID: ${foundUserId.error}`,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const userId = foundUserId.value

  if (!userId) {
    return new Response(
      JSON.stringify({
        message: 'No user id found to be associated with the request session ID',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  if (typeof powerSyncKey?.alg !== 'string') {
    return new Response(
      JSON.stringify({
        message: 'Internal Server Error. PowerSync private key algorithm is not a string',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const jwt = pipe(
    SignJWT.createJWT(),
    (jwt) => SignJWT.setProtectedHeader(jwt, { alg: powerSyncKey?.alg, kid: powerSyncKey?.kid }),
    (jwt) => SignJWT.setSubject(jwt, userId),
    (jwt) => SignJWT.setIssuedAt(jwt),
    (jwt) => SignJWT.setIssuer(jwt, ''), // config?.powersync?.jwtIssuer ?? ''
    (jwt) => SignJWT.setAudience(jwt, 'powersync'), // config?.powersync?.url ?? ''
    (jwt) => SignJWT.setExpirationTime(jwt, '5m'),
  )

  const token = await SignJWT.sign(jwt, powerSyncKey?.key)

  const responseBodyOk: CredentialsResponseBodyOk = {
    token,
    endpoint: CONFIG_SHARED.POWERSYNC_URL,
  }

  const response = new Response(JSON.stringify(responseBodyOk), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  return response
}

export const CredentialsBackend = {
  respond,
}
