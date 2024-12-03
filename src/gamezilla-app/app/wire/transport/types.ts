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
  if (IS_PROD) {
    return `${SESSION_ID_COOKIE_NAME}=${sessionId}; Max-Age=${MAX_AGE}; SameSite=Lax; HttpOnly; Secure; Domain=.gamezilla.app;`
  }

  return `${SESSION_ID_COOKIE_NAME}=${sessionId}; Max-Age=${MAX_AGE}; SameSite=Lax; HttpOnly`
}

export const WEB_SOCKET_ENDPOINT = '/ws'
