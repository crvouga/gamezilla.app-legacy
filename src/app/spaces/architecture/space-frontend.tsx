import { Eff } from '~/@/eff'
import { WithEventId } from '~/@/event-sourced/event'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import type { VDom } from '~/@/vdom/vdom'
import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import type { Space } from '../@/space/space'
import { MsgSpace } from '../core/space-msg/space-msg'
import type { ModelFrontend, MsgFrontend, MsgToBackend, MsgToFrontend } from '../types'

export type SpaceFrontendCtx = AppFrontendCtxBase & {
  space?: Space
}

export type Input = {
  ctx: SpaceFrontendCtx
  model: ModelFrontend
  msg?: MsgFrontend | null
  msgBackend?: MsgToFrontend | null
  msgIn?: unknown | null
  msgSpace?: WithEventId<MsgSpace> | null
}

export type Output = {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgCmd?: AppFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>[]
  msgSpace?: WithEventId<MsgSpace>[]
  msgOut?: unknown[]
}

export type SpaceFrontendModule = {
  init: (input: { ctx: SpaceFrontendCtx; model: ModelFrontend }) => Output
  update: (input: Input) => Output
  subscriptions: (input: { ctx: SpaceFrontendCtx; model: ModelFrontend }) => Sub<MsgFrontend>
  View: (input: { ctx: SpaceFrontendCtx; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => VDom
}

const andThen = (acc: Output, ...updates: ((model: ModelFrontend) => Output)[]): Output => {
  for (const update of updates) {
    const updated = update(acc.model)
    acc = {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgSpace: Msg.batch(acc.msgSpace, updated.msgSpace),
      msgOut: Msg.batch(acc.msgOut, updated.msgOut),
    }
  }
  return acc
}

export const SpaceFrontendModule = {
  andThen,
}
