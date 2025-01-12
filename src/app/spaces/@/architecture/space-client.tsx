import { Msg } from '~/@/msg/msg'
import type { VDom } from '~/@/vdom/vdom'
import type { Space } from '../space/space'
import type { SpaceClientCmd } from '../space-client/cmd'
import { SpaceClientEvt } from '../space-client/evt'
import type { ModelClient, MsgClient, MsgToClient, MsgToBackend } from '../../types'
import { WithEventId } from '~/@/event-sourced/event'
import { SpaceEvent } from '../../core/space-event'
import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { BaseClientCtx } from '~/app/@/client/ctx'

type Ctx = BaseClientCtx & {
  space?: Space
}

export type Input = {
  ctx: Ctx
  model: ModelClient
  msg?: MsgClient | null
  msgBackend?: MsgToClient | null
  msgEvt?: SpaceClientEvt | null
  msgCmd?: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToBackend: MsgToBackend
  }> | null
  msgCore?: WithEventId<SpaceEvent> | null
}

export type Output = {
  model: ModelClient
  eff?: Eff<MsgClient>
  msgCmd?: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToBackend: MsgToBackend
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
      msgCore: Msg.batch(acc.msgCore, updated.msgCore),
    }
  }
  return acc
}

export const SpaceClientModule = {
  andThen,
}
