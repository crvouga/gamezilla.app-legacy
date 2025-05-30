import { WithEventId } from '~/@/event-sourced/event'
import { Msg } from '~/@/msg/msg'
import { type Sub } from '~/@/sub'
import type { ClientId } from '~/@/wire/client-id'
import type { SessionId } from '~/@/wire/session-id'
import type { BackendEvt } from '~/app/@/backend/evt'
import type { UserId } from '~/app/@/data/user-id'
import type { Space } from '../@/space/space'
import { MsgSpace } from '../core/space-msg/space-msg'
import type { MsgBackend, MsgToBackend, SpaceBackendCtxModule } from '../types'

type Ctx = SpaceBackendCtxModule & {
  space?: Space
}

export type Input = {
  ctx: Ctx
  msg?: MsgBackend | null
  msgFrontend?:
    | (MsgToBackend & {
        clientId: ClientId
        sessionId: SessionId
        userId?: UserId | null
      })
    | null
  msgEvt?: BackendEvt | null
  msgSpace?: WithEventId<MsgSpace> | null
}

export type MaybePromise<T> = T | Promise<T>

export type Output = {
  msgEvt?: unknown[]
  msgSpace?: WithEventId<MsgSpace>[]
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
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
      msgSpace: Msg.batch(acc.msgSpace, updated.msgSpace),
    }
  }

  return acc
}

export const SpaceBackendModule = {
  andThen,
}
