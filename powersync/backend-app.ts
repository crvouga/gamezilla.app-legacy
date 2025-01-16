import { SessionId } from '~/app/@/data/session-id'
import { IUserSessionDb } from '~/app/auth/@/backend/user-session-db'
import { SessionIdCookie } from '~/app/wire/transport/session-id-cookie'

export const respond = async (input: {
  request: Request
  ctx: { userSessionDb: IUserSessionDb }
}): Promise<Response | null> => {
  const requestUrl = new URL(input.request.url)
  switch (requestUrl.pathname) {
    case '/powersync/jwt': {
      const maybeSessionId = SessionIdCookie.fromRequest(input.request)
      const sessionId = maybeSessionId ?? SessionId.generate()
      const userId = await input.ctx.userSessionDb.findUserIdBySessionId(sessionId)
      return new Response(
        JSON.stringify({
          maybeSessionId,
          sessionId,
          userId,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }

    case '/powersync/update': {
      return new Response('update', { status: 200 })
    }

    case '/powersync/jwks': {
      return new Response(
        JSON.stringify({
          keys: [
            {
              kty: 'RSA',
              e: 'AQAB',
              use: 'sig',
              kid: 'test',
              alg: 'RS256',
              n: 'test',
            },
          ],
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }
    default: {
      return null
    }
  }
}

export const PowerSyncAppBackend = {
  respond,
}
