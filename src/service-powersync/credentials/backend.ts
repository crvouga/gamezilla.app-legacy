import { pipe } from '~/@/function/pipe'
import * as SignJWT from '~/@/json-crypto/sign-jwt'
import { isErr } from '~/@/result/result'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { UserId } from '~/app/@/data/user-id'
import { CONFIG_SHARED } from '~/config/shared'
import {
  CredentialsResponseBodyErr,
  CredentialsResponseBodyOk,
  GUEST_USER_ID_QUERY_PARAM_NAME,
} from '~/service-powersync/credentials/types'
import { Ctx } from '../@/backend/ctx'
import { getKeyPairFromEnv, KeyPair } from '../@/backend/keys/keys'
import { ILogger } from '~/@/logger'

const respond = async (input: { req: Request; ctx: Ctx; logger: ILogger }) => {
  const logger = input.logger.child(['credentials'])
  logger.info('CredentialsBackend: Responding to request', input.req.url)

  const keys = await getKeyPairFromEnv()

  if (isErr(keys)) {
    logger.error('CredentialsBackend: Failed to get keys:', keys.error)
    return ErrResponse(500, {
      message: `Internal Server Error. Errored while getting keys: ${keys.error}`,
    })
  }

  const maybeSessionId = SessionIdHttp.fromRequest(input.req)

  if (!maybeSessionId) {
    logger.warn('CredentialsBackend: No session ID found in request')
    return ErrResponse(401, {
      message: 'No session ID found in the request',
    })
  }

  logger.info('CredentialsBackend: Found session ID:', maybeSessionId)

  const foundUserId = await input.ctx.userSessionDb.query({
    whereAnd: {
      sessionId: {
        equals: maybeSessionId,
      },
    },
    order: {
      createdAt: 'desc',
    },
    pagination: {
      limit: 1,
      offset: 0,
    },
  })

  if (isErr(foundUserId)) {
    logger.error('CredentialsBackend: Error finding userId for session:', foundUserId.error)
    return ErrResponse(500, {
      message: `Internal Server Error. Errored while finding userID associated with request session ID: ${foundUserId.error}`,
    })
  }

  const userId = foundUserId.value.items[0]?.userId

  if (!userId) {
    logger.info('CredentialsBackend: No userId found for session, checking for guest user')
    const guestUserId = UserId.parse(new URL(input.req.url).searchParams.get(GUEST_USER_ID_QUERY_PARAM_NAME))

    if (isErr(guestUserId)) {
      logger.warn('CredentialsBackend: Invalid or missing guest user ID')
      return ErrResponse(401, {
        message: 'No user id found to be associated with the request session ID and no guest user ID provided',
      })
    }

    logger.info('CredentialsBackend: Using guest user ID:', guestUserId.value)
    return respondOk(keys.value, guestUserId.value, logger)
  }

  logger.info('CredentialsBackend: Using authenticated user ID:', userId)
  return respondOk(keys.value, userId, logger)
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

export const PowerSyncCredentialsBackend = {
  respond,
}
