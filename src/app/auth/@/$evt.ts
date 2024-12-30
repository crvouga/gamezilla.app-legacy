import { PhoneNumber } from '~/@/phone-number'
import { ClientId, SessionId, UserId } from '../../@/data'

export type Evt =
  | {
      n: 'auth'
      t: 'client-authenticated-with-sms'
      sessionId: SessionId
      clientId: ClientId
      phoneNumber: PhoneNumber
    }
  | {
      n: 'auth'
      t: 'client-authenticated'
      sessionId: SessionId
      clientId: ClientId
      userId: UserId
    }
