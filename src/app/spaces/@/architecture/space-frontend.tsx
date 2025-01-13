import { Msg } from '~/@/msg/msg'
import type { VDom } from '~/@/vdom/vdom'
import type { Space } from '../space/space'
import type { SpaceFrontendCmd } from '../space-frontend/cmd'
import { SpaceFrontendEvt } from '../space-frontend/evt'
import type { ModelFrontend, MsgFrontend, MsgToFrontend, MsgToBackend } from '../../types'
import { WithEventId } from '~/@/event-sourced/event'
import { SpaceEvent } from '../../space/space-event'
import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { BaseFrontendCtx } from '~/app/@/frontend/ctx'

type Ctx = BaseFrontendCtx & {
  space?: Space
}

export type Input = {
  ctx: Ctx
  model: ModelFrontend
  msg?: MsgFrontend | null
  msgBackend?: MsgToFrontend | null
  msgEvt?: SpaceFrontendEvt | null
  msgCmd?: SpaceFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }> | null
  msgSpace?: WithEventId<SpaceEvent> | null
}

export type Output = {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgCmd?: SpaceFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>[]
  msgEvt?: SpaceFrontendEvt[]
  msgSpace?: WithEventId<SpaceEvent>[]
}

export type SpaceFrontendModule = {
  init: (input: { ctx: Ctx; model: ModelFrontend }) => Output
  update: (input: Input) => Output
  subscriptions: (input: { ctx: Ctx; model: ModelFrontend }) => Sub<MsgFrontend>
  View: (input: { ctx: Ctx; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => VDom
}

const andThen = (acc: Output, ...updates: ((model: ModelFrontend) => Output)[]): Output => {
  for (const update of updates) {
    const updated = update(acc.model)
    acc = {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
      msgSpace: Msg.batch(acc.msgSpace, updated.msgSpace),
    }
  }
  return acc
}

export const SpaceFrontendModule = {
  andThen,
}
