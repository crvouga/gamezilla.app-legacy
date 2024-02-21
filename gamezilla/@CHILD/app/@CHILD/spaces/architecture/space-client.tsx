import {
  AnonymousClientCtx,
  ClientEvent,
} from "gamezilla/@CHILD/app/@SHARED/client"

import { Eff, Sub, batchMsgs } from "gamezilla/@SHARED/core"
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
import { VDom } from "gamezilla/@SHARED/vdom"

type Ctx = AnonymousClientCtx & {
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

export type MaybePromise<T> = T | Promise<T>

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
  init: (input: { ctx: Ctx; model: ModelClient }) => MaybePromise<Output>
  update: (input: Input) => MaybePromise<Output>
  subscriptions: (input: {
    ctx: Ctx
    model: ModelClient
  }) => MaybePromise<Sub<MsgClient>>
  View: (input: {
    ctx: Ctx
    model: ModelClient
    dispatch: (msg: MsgClient) => void
  }) => VDom
}

const chainUpdates = async (
  accPromise: MaybePromise<Output>,
  ...updates: ((model: ModelClient) => MaybePromise<Output>)[]
): Promise<Output> => {
  const [update, ...rest] = updates

  const acc = await accPromise

  if (!update) {
    return acc
  }

  const updated = await update(acc.model)

  const accNew: Output = {
    model: updated.model,
    eff: Eff.batch([acc.eff, updated.eff]),
    msgCmd: batchMsgs(acc.msgCmd, updated.msgCmd),
    msgEvt: batchMsgs(acc.msgEvt, updated.msgEvt),
    msgSpaceEvent: batchMsgs(acc.msgSpaceEvent, updated.msgSpaceEvent),
  }

  return chainUpdates(accNew, ...rest)
}

export const SpaceClientModule = {
  chainUpdates,
}
