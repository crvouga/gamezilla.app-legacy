import type { FrontendId } from '~/app/@/data/frontend-id'
import type { SessionId } from '~/app/@/data/session-id'
import type { UserId } from '~/app/@/data/user-id'
import type { UserAccount } from '../data/account'
import { PhoneNumber } from '~/@/phone-number'

export type BackendEvt =
  | {
      t: 'wire-evt.frontend-connected'
      frontendId: FrontendId
      sessionId: SessionId
      userId?: UserId
    }
  | {
      t: 'wire-evt.frontend-disconnected'
      frontendId: FrontendId
      sessionId: SessionId
    }
  | {
      t: 'auth-evt.frontend-authenticated'
      user: UserAccount
      sessionId: SessionId
      frontendId: FrontendId
      loggedIn?: boolean
    }
  | {
      t: 'auth-evt.frontend-unauthenticated'
      sessionId: SessionId
      frontendId: FrontendId
    }
  | {
      t: 'auth-evt.frontend-authenticated-with-sms'
      sessionId: SessionId
      frontendId: FrontendId
      phoneNumber: PhoneNumber
    }
