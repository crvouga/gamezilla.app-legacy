import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'

export type GuestSessionMapping = {
  sessionId: SessionId
  guestUserId: UserId
}
