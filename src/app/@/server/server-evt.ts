import { PhoneNumber } from '@/core'
import type { ClientId, SessionId, UserId } from 'app/@/data'
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
