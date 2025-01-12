import { WithEventId } from '~/@/event-sourced/event'
import { Msg } from '~/@/msg/msg'
import { type Sub } from '~/@/sub'
import type { FrontendId } from '~/app/@/data/frontend-id'
import type { SessionId } from '~/app/@/data/session-id'
import type { UserId } from '~/app/@/data/user-id'
import type { BackendEvt } from '~/app/@/backend/evt'
import { SpaceEvent } from '../../core/space-event'
import type { MsgBackend, MsgToFrontend, MsgToBackend, BackendCtx } from '../../types'
import type { Space } from '../space/space'
import type { SpaceBackendCmd } from '../space-backend/cmd'

type Ctx = BackendCtx & {
  space?: Space
}

export type Input = {
  ctx: Ctx
  msg?: MsgBackend | null
  msgFrontend?:
    | (MsgToBackend & {
        frontendId: FrontendId
        sessionId: SessionId
        userId?: UserId | null
      })
    | null
  msgEvt?: BackendEvt | null
  msgCmd?: SpaceBackendCmd<MsgToFrontend> | null
  msgCore?: WithEventId<SpaceEvent> | null
}

export type MaybePromise<T> = T | Promise<T>

export type Output = {
  msgCmd?: SpaceBackendCmd<MsgToFrontend>[]
  msgEvt?: unknown[]
  msgCore?: WithEventId<SpaceEvent>[]
}

export type SpaceBackendModule = {
  init: (input: { ctx: Ctx }) => MaybePromise<Output>
  update: (input: Input) => MaybePromise<Output>
  subscriptions: (input: { ctx: Ctx }) => MaybePromise<Sub<MsgBackend>>
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
      msgCore: Msg.batch(acc.msgCore, updated.msgCore),
    }
  }

  return acc
}

export const SpaceBackendModule = {
  andThen,
}
