import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { pipe } from '~/@/function/pipe'
import { s } from '~/@/schema'
import { ClientId } from '../../@/wire/client-id'
import { SessionId } from '../../@/wire/session-id'
import { UserId } from '../@/data/user-id'

const parser = s.obj({
  clientIds: CappedOrderedDict.parser(ClientId, ClientId),
  sessionId: SessionId,
  userId: s.maybe(UserId),
})

export type WireSession = s.Infer<typeof parser>

const init = (sessionId: SessionId): WireSession => {
  return {
    clientIds: CappedOrderedDict.init({
      maxSize: 10,
    }),
    sessionId,
    userId: null,
  }
}

const addClientId = (wireSession: WireSession, clientId: ClientId): WireSession => {
  return {
    sessionId: wireSession.sessionId,
    clientIds: CappedOrderedDict.add(wireSession.clientIds, clientId, clientId),
    userId: wireSession.userId,
  }
}

const addUserId = (wireSession: WireSession, userId: UserId): WireSession => {
  return {
    sessionId: wireSession.sessionId,
    clientIds: wireSession.clientIds,
    userId,
  }
}

const random = (): WireSession => {
  return pipe(
    init(SessionId.generate()),
    (wireSession) => addClientId(wireSession, ClientId.generate()),
    (wireSession) => addClientId(wireSession, ClientId.generate()),
    (wireSession) => addUserId(wireSession, UserId.generate()),
  )
}

export const WireSession = {
  ...parser,
  init,
  addClientId,
  addUserId,
  random,
}
