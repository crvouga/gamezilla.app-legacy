import { IS_PROD } from 'gamezilla-app/config-public'
import type { SessionId } from 'gamezilla-app/app/@/data'

export type MsgServerToMsgClient<MsgToClient> = {
  m: MsgToClient[]
  v: string
}

export type MsgClientToMsgServer<MsgToServer> = {
  m: MsgToServer[]
  v: string
}

export const ORIGINS = IS_PROD ? 'https://gamezilla.app' : true
export const SESSION_ID_COOKIE_NAME = 'gamezilla-app-session-id'
const MAX_AGE = 31536000
export const toSetSessionCookie = (sessionId: SessionId) => {
  const baseCookie = `${SESSION_ID_COOKIE_NAME}=${sessionId}; Max-Age=${MAX_AGE}; SameSite=Lax;`

  if (IS_PROD) {
    return `${baseCookie} Secure; Domain=.gamezilla.app; HttpOnly;`
  }

  return baseCookie
}

export const WEB_SOCKET_ENDPOINT = '/ws'
