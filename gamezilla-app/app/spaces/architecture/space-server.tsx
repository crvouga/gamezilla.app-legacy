import { ClientId, SessionId, UserId } from "gamezilla-app/app/@SHARED/data"
import { ServerCtx, ServerEvent } from "gamezilla-app/app/@SHARED/server"
import { Eff, Sub } from "gamezilla-app/@SHARED/core"
import { WithEventId } from "../@SHARED/event"
import { Space } from "../@SHARED/space"
import { SpaceServerCmd } from "../@SHARED/space-server-cmd"
import { SpaceEvent } from "../spaces-core"
import {
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
  ServerDeps,
} from "../spaces.core"

type Ctx = ServerCtx & {
  space?: Space
}

export type Input = {
  deps: ServerDeps
  ctx: Ctx
  model: ModelServer
  msg?: MsgServer | null
  msgClient?:
    | (MsgToServer & {
        clientId: ClientId
        sessionId: SessionId
        userId?: UserId | null
      })
    | null
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
  init: (input: {
    ctx: Ctx
    model: ModelServer
    deps: ServerDeps
  }) => MaybePromise<Output>
  update: (input: Input) => MaybePromise<Output>
  subscriptions: (input: {
    ctx: Ctx
    model: ModelServer
    deps: ServerDeps
  }) => MaybePromise<Sub<MsgServer>>
}

const andThen = async (
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

  return andThen(accNew, ...rest)
}

export const SpaceServerModule = {
  andThen,
}
