import { type Sub } from 'gamezilla-app/@/core'
import { Msg } from 'gamezilla-app/@/core/msg'
import type { ClientId, SessionId, UserId } from 'gamezilla-app/app/@/data'
import type { ServerCtx, ServerEvt } from 'gamezilla-app/app/@/server'
import type { WithEventId } from '../@/event'
import type { Space } from '../@/space'
import type { SpaceServerCmd } from '../@/space-server-cmd'
import type { SpaceCoreEvent } from '../spaces-core'
import type { MsgServer, MsgToClient, MsgToServer, ServerDeps } from '../spaces.types'

type Ctx = ServerCtx & {
  space?: Space
}

export type Input = {
  deps: ServerDeps
  ctx: Ctx
  msg?: MsgServer | null
  msgClient?:
    | (MsgToServer & {
        clientId: ClientId
        sessionId: SessionId
        userId?: UserId | null
      })
    | null
  msgEvt?: ServerEvt | null
  msgCmd?: SpaceServerCmd<MsgToClient> | null
  msgCoreEvt?: WithEventId<SpaceCoreEvent> | null
}

export type MaybePromise<T> = T | Promise<T>

export type Output = {
  msgCmd?: SpaceServerCmd<MsgToClient>[]
  msgEvt?: unknown[]
  msgCoreEvt?: WithEventId<SpaceCoreEvent>[]
}

export type SpaceServerModule = {
  init: (input: { ctx: Ctx; deps: ServerDeps }) => MaybePromise<Output>
  update: (input: Input) => MaybePromise<Output>
  subscriptions: (input: { ctx: Ctx; deps: ServerDeps }) => MaybePromise<Sub<MsgServer>>
}

const andThen = async (
  accPromise: MaybePromise<Output>,
  ...updates: (() => MaybePromise<Output>)[]
): Promise<Output> => {
  let acc = await accPromise
  for (const update of updates) {
    const updated = await update()
    acc = {
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
      msgCoreEvt: Msg.batch(acc.msgCoreEvt, updated.msgCoreEvt)
    }
  }

  return acc
}

export const SpaceServerModule = {
  andThen
}
