import type { ClientId } from '~/@/wire/client-id'
import type { SessionId } from '~/@/wire/session-id'
import type { UserId } from '~/app/@/data/user-id'
import type { UserAccount } from '../data/user-account'
import { PhoneNumber } from '~/@/phone-number'
import { ClientSessionId } from '~/@/wire/client-session-id'

export type BackendEvt =
  | {
      t: 'wire-evt.client-connected'
      clientId: ClientId
      sessionId: SessionId
      userId?: UserId
      clientSessionId: ClientSessionId
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
      clientSessionId: ClientSessionId
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
