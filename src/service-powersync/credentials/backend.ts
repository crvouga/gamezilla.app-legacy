import { pipe } from '~/@/function/pipe'
import * as SignJWT from '~/@/json-crypto/sign-jwt'
import { isErr } from '~/@/result/result'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { UserId } from '~/app/@/data/user-id'
import { CONFIG_SHARED } from '~/config/shared'
import { CredentialsResponseBodyErr, CredentialsResponseBodyOk } from '~/service-powersync/credentials/types'
import { Ctx } from '../@/backend/ctx'
import { getKeyPairFromEnv, KeyPair } from '../@/backend/keys/keys'

const respond = async (input: { request: Request; ctx: Ctx }) => {
  input.ctx.logger.info('CredentialsBackend: Responding to request', input.request.url)

  const keys = await getKeyPairFromEnv()

  if (isErr(keys)) {
    input.ctx.logger.error('CredentialsBackend: Failed to get keys:', keys.error)
    return ErrResponse(500, {
      message: `Internal Server Error. Errored while getting keys: ${keys.error}`,
    })
  }

  const maybeSessionId = SessionIdHttp.fromRequest(input.request)

  if (!maybeSessionId) {
    input.ctx.logger.warn('CredentialsBackend: No session ID found in request')
    return ErrResponse(401, {
      message: 'No session ID found in the request',
    })
  }

  input.ctx.logger.info('CredentialsBackend: Found session ID:', maybeSessionId)

  const foundUserId = await input.ctx.userSessionDb.findUserIdBySessionId(maybeSessionId)

  if (isErr(foundUserId)) {
    input.ctx.logger.error('CredentialsBackend: Error finding userId for session:', foundUserId.error)
    return ErrResponse(500, {
      message: `Internal Server Error. Errored while finding userID associated with request session ID: ${foundUserId.error}`,
    })
  }

  const userId = foundUserId.value

  if (!userId) {
    input.ctx.logger.info('CredentialsBackend: No userId found for session, checking for guest user')
    const guestUserId = UserId.parse(new URL(input.request.url).searchParams.get('guestUserId'))

    if (isErr(guestUserId)) {
      input.ctx.logger.warn('CredentialsBackend: Invalid or missing guest user ID')
      return ErrResponse(401, {
        message: 'No user id found to be associated with the request session ID',
      })
    }

    input.ctx.logger.info('CredentialsBackend: Using guest user ID:', guestUserId.value)
    return respondOk(keys.value, guestUserId.value, input.ctx.logger)
  }

  input.ctx.logger.info('CredentialsBackend: Using authenticated user ID:', userId)
  return respondOk(keys.value, userId, input.ctx.logger)
}

const respondOk = async (keys: KeyPair, userId: UserId, logger: Ctx['logger']) => {
  logger.info('CredentialsBackend: Generating JWT for user:', userId)
  const jwt = pipe(
    SignJWT.createJWT(),
    (jwt) => SignJWT.setProtectedHeader(jwt, { alg: keys.privateKey.alg, kid: keys.privateKey.kid }),
    (jwt) => SignJWT.setSubject(jwt, userId),
    (jwt) => SignJWT.setIssuedAt(jwt),
    (jwt) => SignJWT.setIssuer(jwt, ''), // config?.powersync?.jwtIssuer ?? ''
    (jwt) => SignJWT.setAudience(jwt, 'powersync'), // config?.powersync?.url ?? ''
    (jwt) => SignJWT.setExpirationTime(jwt, '5m'),
  )

  const token = await SignJWT.sign(jwt, keys.privateKey.key)
  logger.info('CredentialsBackend: JWT generated successfully, token length:', token.length)

  return OkResponse({
    token,
    endpoint: CONFIG_SHARED.POWERSYNC_URL,
  })
}

const OkResponse = (input: CredentialsResponseBodyOk) => {
  return new Response(JSON.stringify(input), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

const ErrResponse = (status: 401 | 400 | 500, input: CredentialsResponseBodyErr) => {
  return new Response(JSON.stringify(input), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const CredentialsBackend = {
  respond,
}
