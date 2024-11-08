import { type Sub } from '@/core'
import { Msg } from '@/core/msg'
import { WithEventId } from '@/event-sourced/event'
import type { ClientId, SessionId, UserId } from 'gamezilla-app/app/@/data'
import type { ServerEvt } from 'gamezilla-app/app/@/server'
import { SpaceEvent } from '../../core'
import type { MsgServer, MsgToClient, MsgToServer, ServerCtx } from '../../types'
import type { Space } from '../space'
import type { SpaceServerCmd } from '../space-server-cmd'

type Ctx = ServerCtx & {
  space?: Space
}

export type Input = {
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
  msgCore?: WithEventId<SpaceEvent> | null
}

export type MaybePromise<T> = T | Promise<T>

export type Output = {
  msgCmd?: SpaceServerCmd<MsgToClient>[]
  msgEvt?: unknown[]
  msgCore?: WithEventId<SpaceEvent>[]
}

export type SpaceServerModule = {
  init: (input: { ctx: Ctx }) => MaybePromise<Output>
  update: (input: Input) => MaybePromise<Output>
  subscriptions: (input: { ctx: Ctx }) => MaybePromise<Sub<MsgServer>>
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
      msgCore: Msg.batch(acc.msgCore, updated.msgCore)
    }
  }

  return acc
}

export const SpaceServerModule = {
  andThen
}
