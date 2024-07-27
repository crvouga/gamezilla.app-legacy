import type { AnonymousClientCtx, ClientEvt } from 'gamezilla-app/app/@/client'

import { Eff, batchMsgs, type Sub } from 'gamezilla-app/@/core'
import type { VDom } from 'gamezilla-app/@/vdom'
import type { WithEventId } from '../@/event'
import type { Space } from '../@/space'
import type { SpaceClientCmd } from '../@/space-client-cmd'
import type { SpaceCoreEvent } from '../spaces-core'
import type { ModelClient, MsgClient, MsgToClient, MsgToServer } from '../spaces.types'

type Ctx = AnonymousClientCtx & {
  space?: Space
}

export type Input = {
  ctx: Ctx
  model: ModelClient

  msg?: MsgClient | null
  msgServer?: MsgToClient | null
  msgEvt?: ClientEvt | null
  msgCmd?: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }> | null
  msgSpaceEvent?: WithEventId<SpaceCoreEvent> | null
}

export type MaybePromise<T> = T | Promise<T>

export type Output = {
  model: ModelClient
  eff?: Eff<MsgClient>
  msgCmd?: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>[]
  msgEvt?: unknown[]
  msgSpaceEvent?: WithEventId<SpaceCoreEvent>[]
}

export type SpaceClientModule = {
  init: (input: { ctx: Ctx; model: ModelClient }) => MaybePromise<Output>
  update: (input: Input) => MaybePromise<Output>
  subscriptions: (input: { ctx: Ctx; model: ModelClient }) => MaybePromise<Sub<MsgClient>>
  View: (input: { ctx: Ctx; model: ModelClient; dispatch: (msg: MsgClient) => void }) => VDom
}

const andThen = async (
  accPromise: MaybePromise<Output>,
  ...updates: ((model: ModelClient) => MaybePromise<Output>)[]
): Promise<Output> => {
  let acc = await accPromise
  for (const update of updates) {
    const updated = await update(acc.model)
    acc = {
      model: updated.model,
      eff: Eff.batch([acc.eff, updated.eff]),
      msgCmd: batchMsgs(acc.msgCmd, updated.msgCmd),
      msgEvt: batchMsgs(acc.msgEvt, updated.msgEvt),
      msgSpaceEvent: batchMsgs(acc.msgSpaceEvent, updated.msgSpaceEvent)
    }
  }
  return acc
}

export const SpaceClientModule = {
  andThen
}
