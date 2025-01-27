import { Eff } from '~/@/eff'
import { WithEventId } from '~/@/event-sourced/event'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import type { VDom } from '~/@/vdom/vdom'
import { BaseFrontendCtx } from '~/app/@/frontend/ctx'
import { ScreenActionsProps } from '~/app/@/ui/screen/screen-layout'
import { MsgSpace } from '../../core/space-msg'
import type { ModelFrontend, MsgFrontend, MsgToBackend, MsgToFrontend } from '../../types'
import type { SpaceFrontendCmd } from '../frontend/cmd'
import { SpaceFrontendEvt } from '../frontend/evt'
import type { Space } from '../space/space'

type Ctx = BaseFrontendCtx & {
  space?: Space
  parentScreenActions?: ScreenActionsProps | null
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
  msgSpace?: WithEventId<MsgSpace> | null
}

export type Output = {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgCmd?: SpaceFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>[]
  msgEvt?: SpaceFrontendEvt[]
  msgSpace?: WithEventId<MsgSpace>[]
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
