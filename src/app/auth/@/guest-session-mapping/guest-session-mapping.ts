import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { GuestSessionMappingId } from './guest-session-mapping-id'

export type GuestSessionMapping = {
  id: GuestSessionMappingId
  sessionId: SessionId | null
  clientSessionId: ClientSessionId
  guestUserId: UserId
}

const random = (overrides?: Partial<GuestSessionMapping>): GuestSessionMapping => {
  return {
    id: GuestSessionMappingId.generate(),
    sessionId: SessionId.generate(),
    clientSessionId: ClientSessionId.generate(),
    guestUserId: UserId.generate(),
    ...overrides,
  }
}

export const GuestSessionMapping = {
  random,
}
