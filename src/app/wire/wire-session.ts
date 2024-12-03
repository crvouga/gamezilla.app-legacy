import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { pipe } from '~/@/core'
import { p } from '~/@/core/parser'
import { ClientId, SessionId, UserId } from '~/app/@/data'

const parser = p.obj({
  clientIds: CappedOrderedDict.parser(ClientId, ClientId),
  sessionId: SessionId,
  userId: p.maybe(UserId)
})

export type WireSession = p.Infer<typeof parser>

const init = (sessionId: SessionId): WireSession => {
  return {
    clientIds: CappedOrderedDict.init({
      maxSize: 10
    }),
    sessionId,
    userId: null
  }
}

const addClientId = (wireSession: WireSession, clientId: ClientId): WireSession => {
  return {
    sessionId: wireSession.sessionId,
    clientIds: CappedOrderedDict.add(wireSession.clientIds, clientId, clientId),
    userId: wireSession.userId
  }
}

const addUserId = (wireSession: WireSession, userId: UserId): WireSession => {
  return {
    sessionId: wireSession.sessionId,
    clientIds: wireSession.clientIds,
    userId
  }
}

const random = (): WireSession => {
  return pipe(
    init(SessionId.generate()),
    (wireSession) => addClientId(wireSession, ClientId.generate()),
    (wireSession) => addClientId(wireSession, ClientId.generate()),
    (wireSession) => addUserId(wireSession, UserId.generate())
  )
}

export const WireSession = {
  ...parser,
  init,
  addClientId,
  addUserId,
  random
}
