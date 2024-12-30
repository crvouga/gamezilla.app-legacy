import { PhoneNumber } from '~/@/phone-number'
import { ClientId } from '~/app/@/data/client-id'
import { SessionId } from '~/app/@/data/session-id'
import { UserId } from '~/app/@/data/user-id'

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
