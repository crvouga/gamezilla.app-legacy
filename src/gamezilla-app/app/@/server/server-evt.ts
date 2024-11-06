import { PhoneNumber, Posix } from 'gamezilla-app/@/core'
import type { ClientId, SessionId, UserId } from 'gamezilla-app/app/@/data'
import type { UserAccount } from '../data/account'

export type ServerEvt =
  | {
      t: 'wire/client-connected'
      clientId: ClientId
      sessionId: SessionId
      userId?: UserId
    }
  | {
      t: 'wire/client-disconnected'
      clientId: ClientId
      sessionId: SessionId
    }
  | {
      t: 'auth/client-authenticated'
      user: UserAccount
      sessionId: SessionId
      clientId: ClientId
      loggedIn?: boolean
    }
  | {
      t: 'auth/client-unauthenticated'
      sessionId: SessionId
      clientId: ClientId
    }
  | {
      t: 'auth/client-authenticated-with-sms'
      sessionId: SessionId
      clientId: ClientId
      phoneNumber: PhoneNumber
    }
  | {
      t: 'server/started'
      ipAddress: string
      port: number
      startedAt: Posix
    }
  | {
      t: 'server/stopping'
      stoppedAt: Posix
    }
