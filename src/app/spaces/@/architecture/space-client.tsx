import { Eff, type Sub } from '~/@/core'
import { Msg } from '~/@/core/msg'
import type { VDom } from '~/@/vdom'
import type { BaseClientCtx } from '~/app/@/client'
import type { Space } from '../space'
import type { SpaceClientCmd } from '../space-client-cmd'
import { SpaceClientEvt } from '../space-client-evt'
import type { ModelClient, MsgClient, MsgToClient, MsgToServer } from '../../types'
import { WithEventId } from '~/@/event-sourced/event'
import { SpaceEvent } from '../../core'

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
  msgCore?: WithEventId<SpaceEvent> | null
}

export type Output = {
  model: ModelClient
  eff?: Eff<MsgClient>
  msgCmd?: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>[]
  msgEvt?: SpaceClientEvt[]
  msgCore?: WithEventId<SpaceEvent>[]
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
      msgCore: Msg.batch(acc.msgCore, updated.msgCore)
    }
  }
  return acc
}

export const SpaceClientModule = {
  andThen
}
