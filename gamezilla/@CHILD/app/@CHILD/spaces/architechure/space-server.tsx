import { ServerCtx, ServerEvent } from "gamezilla/@CHILD/app/@SHARED/server"
import { Eff, Sub } from "gamezilla/@SHARED/core"
import { WithEventId } from "../@SHARED/event"
import { Space } from "../@SHARED/space"
import { SpaceServerCmd } from "../@SHARED/space-server-cmd"
import { SpaceEvent } from "../spaces-core"
import {
  ModelServer,
  MsgClient,
  MsgServer,
  MsgToClient,
  MsgToServer,
} from "../spaces.core"

type Ctx = ServerCtx & {
  space?: Space
}

export type Input = {
  ctx: Ctx
  model: ModelServer
  msg?: MsgServer | null
  msgClient?: MsgToServer | null
  msgEvt?: ServerEvent | null
  msgCmd?: SpaceServerCmd<MsgToClient> | null
  msgSpaceEvent?: WithEventId<SpaceEvent> | null
}

export type MaybePromise<T> = T | Promise<T>

export type Output = {
  model: ModelServer
  eff?: Eff<MsgServer>
  msgCmd?: SpaceServerCmd<MsgToClient>[]
  msgEvt?: unknown[]
  msgSpaceEvent?: WithEventId<SpaceEvent>[]
}

export type SpaceServerModule = {
  init: (input: { ctx: Ctx; model: ModelServer }) => MaybePromise<Output>
  update: (input: Input) => MaybePromise<Output>
  subscriptions: (input: { ctx: Ctx; model: ModelServer }) => Sub<MsgClient>
}

const chainUpdates = async (
  accPromise: MaybePromise<Output>,
  ...updates: ((model: ModelServer) => MaybePromise<Output>)[]
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
    msgCmd: [...(acc.msgCmd ?? []), ...(updated.msgCmd ?? [])],
    msgEvt: [...(acc.msgEvt ?? []), ...(updated.msgEvt ?? [])],
    msgSpaceEvent: [
      ...(acc.msgSpaceEvent ?? []),
      ...(updated.msgSpaceEvent ?? []),
    ],
  }

  return chainUpdates(accNew, ...rest)
}

export const SpaceClientModule = {
  chainUpdates,
}
