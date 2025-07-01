import { Eff } from '~/@/eff'
import { WithEventId } from '~/@/event-sourced/event'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import type { VDom } from '~/@/vdom/vdom'
import { MsgSpace } from '../space/msg-space'
import type { ModelFrontend, MsgFrontend, FrontendCtxModule } from '../types'

export type Input = {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg?: MsgFrontend | null
  msgIn?: unknown | null
  msgSpace?: WithEventId<MsgSpace> | null
}

export type Output = {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgSpace?: WithEventId<MsgSpace>[]
  msgOut?: unknown[]
}

export type SpaceFrontendModule = {
  init: (input: { ctx: FrontendCtxModule; model: ModelFrontend }) => Output
  update: (input: Input) => Output
  subscriptions: (input: { ctx: FrontendCtxModule; model: ModelFrontend }) => Sub<MsgFrontend>
  View: (input: { ctx: FrontendCtxModule; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => VDom
}

const andThen = (acc: Output, ...updates: ((model: ModelFrontend) => Output)[]): Output => {
  for (const update of updates) {
    const updated = update(acc.model)
    acc = {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgSpace: Msg.batch(acc.msgSpace, updated.msgSpace),
      msgOut: Msg.batch(acc.msgOut, updated.msgOut),
    }
  }
  return acc
}

export const SpaceFrontendModule = {
  andThen,
}
