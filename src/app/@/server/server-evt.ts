import type { ClientId } from '~/app/@/data/client-id'
import type { SessionId } from '~/app/@/data/session-id'
import type { UserId } from '~/app/@/data/user-id'
import type { UserAccount } from '../data/account'
import { PhoneNumber } from '~/@/phone-number'

export type ServerEvt =
  | {
      t: 'wire-evt.client-connected'
      clientId: ClientId
      sessionId: SessionId
      userId?: UserId
    }
  | {
      t: 'wire-evt.client-disconnected'
      clientId: ClientId
      sessionId: SessionId
    }
  | {
      t: 'auth-evt.client-authenticated'
      user: UserAccount
      sessionId: SessionId
      clientId: ClientId
      loggedIn?: boolean
    }
  | {
      t: 'auth-evt.client-unauthenticated'
      sessionId: SessionId
      clientId: ClientId
    }
  | {
      t: 'auth-evt.client-authenticated-with-sms'
      sessionId: SessionId
      clientId: ClientId
      phoneNumber: PhoneNumber
    }
