import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { pipe } from '~/@/function/pipe'
import { p } from '~/@/parser'
import { FrontendId } from '../@/data/frontend-id'
import { SessionId } from '../@/data/session-id'
import { UserId } from '../@/data/user-id'

const parser = p.obj({
  frontendIds: CappedOrderedDict.parser(FrontendId, FrontendId),
  sessionId: SessionId,
  userId: p.maybe(UserId),
})

export type WireSession = p.Infer<typeof parser>

const init = (sessionId: SessionId): WireSession => {
  return {
    frontendIds: CappedOrderedDict.init({
      maxSize: 10,
    }),
    sessionId,
    userId: null,
  }
}

const addFrontendId = (wireSession: WireSession, frontendId: FrontendId): WireSession => {
  return {
    sessionId: wireSession.sessionId,
    frontendIds: CappedOrderedDict.add(wireSession.frontendIds, frontendId, frontendId),
    userId: wireSession.userId,
  }
}

const addUserId = (wireSession: WireSession, userId: UserId): WireSession => {
  return {
    sessionId: wireSession.sessionId,
    frontendIds: wireSession.frontendIds,
    userId,
  }
}

const random = (): WireSession => {
  return pipe(
    init(SessionId.generate()),
    (wireSession) => addFrontendId(wireSession, FrontendId.generate()),
    (wireSession) => addFrontendId(wireSession, FrontendId.generate()),
    (wireSession) => addUserId(wireSession, UserId.generate()),
  )
}

export const WireSession = {
  ...parser,
  init,
  addFrontendId,
  addUserId,
  random,
}
