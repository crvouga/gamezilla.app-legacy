import { Eff, type Sub } from 'gamezilla-app/@/core'
import { Msg } from 'gamezilla-app/@/core/msg'
import type { VDom } from 'gamezilla-app/@/vdom'
import type { BaseClientCtx } from 'gamezilla-app/app/@/client'
import type { WithEventId } from '../@/event'
import type { Space, SpaceClientEvt } from '../@/space'
import type { SpaceClientCmd } from '../@/space-client-cmd'
import type { SpaceCoreEvent } from '../spaces-core'
import type { ModelClient, MsgClient, MsgToClient, MsgToServer } from '../spaces.types'

type Ctx = BaseClientCtx & {
  space?: Space
}

export type Input = {
  ctx: Ctx
  model: ModelClient
  msg?: MsgClient | null
  msgServer?: MsgToClient | null
  msgEvt?: SpaceClientEvt | null
  msgCmd?: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }> | null
  msgCoreEvt?: WithEventId<SpaceCoreEvent> | null
}

export type Output = {
  model: ModelClient
  eff?: Eff<MsgClient>
  msgCmd?: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>[]
  msgEvt?: SpaceClientEvt[]
  msgCoreEvt?: WithEventId<SpaceCoreEvent>[]
}

export type SpaceClientModule = {
  init: (input: { ctx: Ctx; model: ModelClient }) => Output
  update: (input: Input) => Output
  subscriptions: (input: { ctx: Ctx; model: ModelClient }) => Sub<MsgClient>
  View: (input: { ctx: Ctx; model: ModelClient; dispatch: (msg: MsgClient) => void }) => VDom
}

const andThen = (acc: Output, ...updates: ((model: ModelClient) => Output)[]): Output => {
  for (const update of updates) {
    const updated = update(acc.model)
    acc = {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
      msgCoreEvt: Msg.batch(acc.msgCoreEvt, updated.msgCoreEvt)
    }
  }
  return acc
}

export const SpaceClientModule = {
  andThen
}
