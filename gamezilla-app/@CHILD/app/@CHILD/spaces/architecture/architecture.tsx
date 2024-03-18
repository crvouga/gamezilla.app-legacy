import {
  BaseClientCtx,
  ClientEvent,
} from "gamezilla-app/@CHILD/app/@SHARED/client"

import { Eff, Sub, batchMsgs } from "gamezilla-app/@SHARED/core"
import { VDom } from "gamezilla-app/@SHARED/vdom"
import { WithEventId } from "../@SHARED/event"
import { Space } from "../@SHARED/space"
import { SpaceClientCmd } from "../@SHARED/space-client-cmd"
import { SpaceEvent } from "../spaces-core"
import {
  ModelClient,
  ModelLocation,
  MsgClient,
  MsgToClient,
  MsgToServer,
} from "../spaces.core"

type Ctx = BaseClientCtx & {
  space?: Space
}

export type Input = {
  ctx: Ctx
  model: ModelClient
  modelLocation?: ModelLocation
  msg?: MsgClient | null
  msgServer?: MsgToClient | null
  msgEvt?: ClientEvent | null
  msgCmd?: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }> | null
  msgSpaceEvent?: WithEventId<SpaceEvent> | null
}

export type Output = {
  model: ModelClient
  modelLocation?: {
    t: "replace" | "push"
    c: ModelLocation
  }
  eff?: Eff<MsgClient>
  msgCmd?: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>[]
  msgEvt?: unknown[]
  msgSpaceEvent?: WithEventId<SpaceEvent>[]
}

export type SpaceClientModule = {
  init: (input: { ctx: Ctx; model: ModelClient }) => Output
  update: (input: Input) => Output
  subscriptions: (input: { ctx: Ctx; model: ModelClient }) => Sub<MsgClient>
  View: (input: {
    ctx: Ctx
    model: ModelClient
    dispatch: (msg: MsgClient) => void
  }) => VDom
}

const andThen = (
  acc: Output,
  ...updates: ((model: ModelClient) => Output)[]
): Output => {
  const [update, ...rest] = updates

  if (!update) {
    return acc
  }

  const updated = update(acc.model)

  const accNew: Output = {
    model: updated.model,
    eff: Eff.batch([acc.eff, updated.eff]),
    msgCmd: batchMsgs(acc.msgCmd, updated.msgCmd),
    msgEvt: batchMsgs(acc.msgEvt, updated.msgEvt),
    msgSpaceEvent: batchMsgs(acc.msgSpaceEvent, updated.msgSpaceEvent),
  }

  return andThen(accNew, ...rest)
}

export const SpaceClientModule = {
  andThen,
}
