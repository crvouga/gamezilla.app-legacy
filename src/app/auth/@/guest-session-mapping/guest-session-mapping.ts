import { FromUnknown } from '~/@/from-unknown/from-unknown'
import { s } from '~/@/schema'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { UserId } from '~/app/@/data/user-id'
import { GuestSessionMappingId } from './guest-session-mapping-id'

const schema = s.obj({
  id: GuestSessionMappingId,
  sessionId: s.maybe(SessionId),
  clientSessionId: ClientSessionId,
  guestUserId: UserId,
})

export type GuestSessionMapping = s.Infer<typeof schema>

const random = (overrides?: Partial<GuestSessionMapping>): GuestSessionMapping => {
  return {
    id: GuestSessionMappingId.generate(),
    sessionId: SessionId.generate(),
    clientSessionId: ClientSessionId.generate(),
    guestUserId: UserId.generate(),
    ...overrides,
  }
}

const fromUnknown = FromUnknown<GuestSessionMapping>()

export const GuestSessionMapping = {
  ...fromUnknown,
  random,
}
