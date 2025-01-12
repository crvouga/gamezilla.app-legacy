import type { ClientId } from '~/app/@/data/client-id'
import type { SessionId } from '~/app/@/data/session-id'
import type { UserId } from '~/app/@/data/user-id'
import type { UserAccount } from '../data/account'
import { PhoneNumber } from '~/@/phone-number'

export type BackendEvt =
  | {
      t: 'wire-evt.frontend-connected'
      clientId: ClientId
      sessionId: SessionId
      userId?: UserId
    }
  | {
      t: 'wire-evt.frontend-disconnected'
      clientId: ClientId
      sessionId: SessionId
    }
  | {
      t: 'auth-evt.frontend-authenticated'
      user: UserAccount
      sessionId: SessionId
      clientId: ClientId
      loggedIn?: boolean
    }
  | {
      t: 'auth-evt.frontend-unauthenticated'
      sessionId: SessionId
      clientId: ClientId
    }
  | {
      t: 'auth-evt.frontend-authenticated-with-sms'
      sessionId: SessionId
      clientId: ClientId
      phoneNumber: PhoneNumber
    }
