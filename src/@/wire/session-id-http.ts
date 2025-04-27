import { SessionId } from '~/@/wire/session-id'

const SESSION_ID_COOKIE_NAME = 'session-id'
const MAX_AGE = 31536000

const fromCookies = (input: { cookies: string }): SessionId | null => {
  const maybeSessionIdCookie = input.cookies
    ?.split(';')
    ?.map((cookie) => cookie.trim())
    ?.find((cookie) => cookie.startsWith(`${SESSION_ID_COOKIE_NAME}=`))
    ?.split('=')

  const maybeSessionId = maybeSessionIdCookie ? maybeSessionIdCookie[1] : null

  if (SessionId.is(maybeSessionId)) {
    return maybeSessionId
  }

  return null
}

const toSetCookieHeaderValue = (input: { sessionId: SessionId; isProd: boolean }) => {
  if (input.isProd) {
    return `${SESSION_ID_COOKIE_NAME}=${input.sessionId}; Max-Age=${MAX_AGE}; SameSite=Strict; HttpOnly; Secure; Path=/;`
  }

  return `${SESSION_ID_COOKIE_NAME}=${input.sessionId}; Max-Age=${MAX_AGE}; SameSite=Lax; HttpOnly;`
}

const fromRequest = (request: Request): SessionId | null => {
  const cookie = request.headers?.get('cookie')?.split(';')

  const cookies = cookie?.join(';') ?? ''

  const maybeSessionId = SessionIdHttp.fromCookies({ cookies })

  return maybeSessionId
}

export const SessionIdHttp = {
  fromCookies,
  toSetCookieHeaderValue,
  fromRequest,
}
