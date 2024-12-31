import { SessionId } from '~/app/@/data/session-id'

const SESSION_ID_COOKIE_NAME = 'gamezilla-app-session-id'
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

const toSetCookie = (input: { sessionId: SessionId; isProd: boolean }) => {
  if (input.isProd) {
    return `
      ${SESSION_ID_COOKIE_NAME}=${input.sessionId}; 
      Max-Age=${MAX_AGE}; 
      SameSite=None; 
      HttpOnly; 
      Secure; 
      Domain=.gamezilla.app;
    `
  }

  return `
    ${SESSION_ID_COOKIE_NAME}=${input.sessionId}; 
    Max-Age=${MAX_AGE}; 
    SameSite=None; 
    HttpOnly;
  `
}

export const SessionIdCookie = {
  fromCookies,
  toSetCookie
}
