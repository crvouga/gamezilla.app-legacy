import { type Sub } from '@/core'
import { Msg } from '@/core/msg'
import type { ClientId, SessionId, UserId } from 'gamezilla-app/app/@/data'
import type { AppServerCtx, ServerEvt } from 'gamezilla-app/app/@/server'
import type { MsgServer, MsgToClient, MsgToServer, ServerDeps } from '../../types'
import type { Space } from '../space'
import type { SpaceServerCmd } from '../space-server-cmd'
import { SpaceEvent } from '../../core'
import { WithEventId } from '@/event-sourced/event'

type Ctx = AppServerCtx & {
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
  msgCore?: WithEventId<SpaceEvent> | null
}

export type MaybePromise<T> = T | Promise<T>

export type Output = {
  msgCmd?: SpaceServerCmd<MsgToClient>[]
  msgEvt?: unknown[]
  msgCore?: WithEventId<SpaceEvent>[]
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
      msgCore: Msg.batch(acc.msgCore, updated.msgCore)
    }
  }

  return acc
}

export const SpaceServerModule = {
  andThen
}
