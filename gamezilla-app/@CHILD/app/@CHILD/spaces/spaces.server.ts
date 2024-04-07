import {
  WithEventId,
  withId,
} from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { SpaceServerCmd } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd"
import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import {
  ServerCmd,
  ServerCtx,
  broadcast,
  sendBack,
  sendToClient,
  sendToUser,
} from "gamezilla-app/@CHILD/app/@SHARED/server"
import { Eff, Result, Sub, batchMsgs } from "gamezilla-app/@SHARED/core"
import { AppServerModule } from "../../@SHARED/architecture/app-server"
import { Game } from "./@CHILD/game/game.server"
import { ProfileCache } from "./profile-cache"
import * as Space from "./spaces-core/space"
import { SpaceEvent } from "./spaces-core/space-event"
import * as SpaceState from "./spaces-core/space-state"
import * as Spaces from "./spaces-core/spaces-core.client"
import {
  ModelServer,
  MsgServer,
  MsgToClient,
  ServerDeps,
  ServerModule,
  spacesToProfiles,
} from "./spaces.core"
import { Input, Output, SpaceServerModule } from "./architecture/space-server"
import { SyncServer } from "./sync/sync.server"
import { ListSpacesServer } from "./list-spaces/list-spaces.server"

//
//
//
//
//
//

export const getDeps: ServerModule["getDeps"] = ({ ctx }) => {
  return {
    ProfileCache: ProfileCache({
      t: "db-kv",
      dbConnKv: ctx.dbConnKv,
    }),
  }
}

//
//
//
// Model
//
//
//

export const init: ServerModule["init"] = async () => {
  return {
    model: {
      ...Spaces.init,
      games: {},
      profileCache: {},
    },
  }
}

//
//
//
// Update
//
//
//

export const update: ServerModule["update"] = async (input) => {
  const updated = await updateMain(input)
  return AppServerModule.andThen(
    {
      model: updated.model,
      eff: updated.eff,
      msgCmd: SpaceServerCmd.toServerCmd(updated.msgCmd),
    },
    (model) => updateFromClient({ ...input, model }),
    (model) => updateChild_({ ...input, model }),
  )
}

const updateMain = async (input: Input, acc?: Output): Promise<Output> => {
  acc = acc ?? (await updateChild(input))

  const [spaceEvent, ...spaceEventsRest] = acc.msgSpaceEvent ?? []

  if (spaceEvent) {
    const updated = await updateChild({
      deps: input.deps,
      ctx: input.ctx,
      model: acc.model,
      msgSpaceEvent: spaceEvent,
    })

    return updateMain(input, {
      model: updated.model,
      eff: Eff.batch([acc.eff, updated.eff]),
      msgSpaceEvent: batchMsgs(spaceEventsRest, updated.msgSpaceEvent),
      msgCmd: batchMsgs(acc.msgCmd, updated.msgCmd),
      msgEvt: updated.msgEvt,
    })
  }

  const [spaceCmd, ...spaceCmdsRest] = SpaceServerCmd.toSpaceServerCmd(
    acc.msgCmd,
  )

  if (spaceCmd) {
    const updated = await updateChild({
      deps: input.deps,
      ctx: input.ctx,
      model: acc.model,
      msgCmd: spaceCmd,
    })

    return updateMain(input, {
      model: updated.model,
      eff: Eff.batch([acc.eff, updated.eff]),
      msgSpaceEvent: batchMsgs(acc.msgSpaceEvent, updated.msgSpaceEvent),
      msgCmd: batchMsgs(spaceCmdsRest, updated.msgCmd),
      msgEvt: updated.msgEvt,
    })
  }

  return acc
}

const updateChild: SpaceServerModule["update"] = async (input) => {
  if (
    input.msgSpaceEvent &&
    Spaces.hasEvent(
      input.model,
      input.msgSpaceEvent.spaceId,
      input.msgSpaceEvent.eventId,
    )
  ) {
    return { model: input.model }
  }

  return SpaceServerModule.andThen(
    { model: input.model },
    //
    (model) => SyncServer.update({ ...input, model }),
    (model) => ListSpacesServer.update({ ...input, model }),
  )
}

const updateFromClient: ServerModule["update"] = async (input) => {
  const { msgClient, model, ctx } = input

  if (!msgClient) {
    return { model }
  }

  switch (msgClient.t) {
    case "game": {
      return { model }
    }

    case "event": {
      return updateFromManySpaceEvents({
        deps: input.deps,
        ctx: ctx,
        msgEvts: [msgClient.c],
        model,
      })
    }

    default: {
      return { model }
    }
  }
}

const spaceCmdToCmd = (
  spaceState: SpaceState.State,
  msgCmd?: SpaceServerCmd<MsgToClient>[],
) => {
  return msgCmd?.map((msgCmd): ServerCmd<MsgToClient> => {
    switch (msgCmd.t) {
      case "send-to-space": {
        return sendToUser(SpaceState.toUserIds(spaceState), msgCmd.msg)
      }

      default: {
        return msgCmd
      }
    }
  })
}

const inputToSpaceId = (input: Parameters<ServerModule["update"]>[0]) => {
  const spaceId =
    input.msg && "spaceId" in input.msg
      ? input.msg.spaceId
      : input.msgClient && "spaceId" in input.msgClient
      ? input.msgClient.spaceId
      : null

  return spaceId
}

const updateChild_: ServerModule["update"] = async (input) => {
  const { msg, msgEvt, msgClient, ctx, model } = input

  const spaceId = inputToSpaceId(input)

  if (!spaceId) {
    return { model }
  }

  const spaceState = Spaces.toSpaceStarted(model, spaceId)

  if (!spaceState) {
    return { model }
  }

  if (!spaceState.game) {
    return { model }
  }

  if (msgClient && !msgClient.userId) {
    ctx.logger.warn("msgClient is missing userId")
  }

  const gameUpdated = await Game.update({
    ctx: { ...ctx, space: spaceState },
    model: model.games[spaceId] ?? Game.init(spaceState.game.t),
    msg: msg?.t === "game" ? msg.c : null,
    msgClient:
      msgClient?.t === "game" && msgClient.userId
        ? { ...msgClient, userId: msgClient.userId, ...msgClient.c }
        : null,
    msgEvt,
    modelSync: spaceState.game,
    deps: null,
  })

  const merged = mergeUpdatedGame({ model, spaceId, gameUpdated })

  return AppServerModule.andThen(merged, (model) =>
    updateFromManySpaceEvents({
      deps: input.deps,
      model,
      ctx,
      msgEvts: merged.spaceEvents,
    }),
  )
}

const mergeUpdatedGame = ({
  model,
  spaceId,
  gameUpdated,
}: {
  spaceId: SpaceId
  model: ModelServer
  gameUpdated: Awaited<ReturnType<typeof Game.update>>
}): {
  model: ModelServer
  msgCmd: ServerCmd<MsgToClient>[]
  eff: Eff<MsgServer>
  spaceEvents: WithEventId<SpaceEvent>[]
} => {
  const spaceState = Spaces.toSpaceState(model, spaceId)
  return {
    model: {
      ...model,
      games: {
        ...model.games,
        [spaceId]: gameUpdated.model,
      },
    },
    msgCmd:
      spaceCmdToCmd(
        spaceState,
        SpaceServerCmd.map(gameUpdated.msgCmd, (c) => ({
          t: "game",
          spaceId,
          c,
        })),
      ) ?? [],
    eff: Eff.map_((c) => ({ t: "game", c, spaceId }), gameUpdated.eff),
    spaceEvents:
      gameUpdated.msgSync?.map((c) =>
        withId<SpaceEvent>({ t: "game", spaceId, c }),
      ) ?? [],
  }
}

type Acc = {
  model: ModelServer
  msgCmd?: ServerCmd<MsgToClient>[]
  eff?: Eff<MsgServer>
}

const updateFromManySpaceEvents = async (input: {
  deps: ServerDeps
  ctx: ServerCtx
  model: ModelServer
  msgEvts: WithEventId<SpaceEvent>[]
}): Promise<Acc> => {
  return updateFromManySpaceEventsLoop(
    input.deps,
    input.ctx,
    input.msgEvts,
    input,
  )
}

const updateFromManySpaceEventsLoop = async (
  deps: ServerDeps,
  ctx: ServerCtx,
  spaceEvents: WithEventId<SpaceEvent>[],
  acc: Acc,
): Promise<Acc> => {
  const [spaceEvent, ...spaceEventsRest] = spaceEvents

  if (!spaceEvent) {
    return acc
  }

  const spaceModel = Spaces.toSpace(acc.model, spaceEvent.spaceId) ?? Space.init

  if (!spaceModel) {
    return updateFromManySpaceEventsLoop(deps, ctx, spaceEventsRest, acc)
  }

  if (Space.hasEvent(spaceModel, spaceEvent.eventId)) {
    return updateFromManySpaceEventsLoop(deps, ctx, spaceEventsRest, acc)
  }

  const updated = await AppServerModule.andThen(
    acc,
    (model) => Spaces.updateFromSpaceEvent({ model, spaceEvent }),
    (model) => updateFromSpaceEvent({ model, spaceEvent, ctx }),
    (model) => sendEventMsgToClients({ deps, model, spaceEvent }),
  )

  const accNew: Acc = {
    model: updated.model,
    msgCmd: batchMsgs(acc.msgCmd, updated.msgCmd),
    eff: Eff.batch([acc.eff, updated.eff]),
  }

  const msgEvtsNew: WithEventId<SpaceEvent>[] = batchMsgs(
    spaceEventsRest,
    updated.msgEvt ?? [],
  )

  return updateFromManySpaceEventsLoop(deps, ctx, msgEvtsNew, accNew)
}

const sendEventMsgToClients = async ({
  model,
  spaceEvent,
  deps,
}: {
  deps: ServerDeps
  model: ModelServer
  spaceEvent: WithEventId<SpaceEvent>
}): Promise<Acc> => {
  const msgEvtWithMeta = Spaces.toEventWithMeta(
    model,
    spaceEvent.spaceId,
    spaceEvent.eventId,
  )

  if (!msgEvtWithMeta) {
    return { model }
  }

  const spaceState = Spaces.toSpaceStarted(model, msgEvtWithMeta.spaceId)

  const profiles = Result.withDefault(
    await deps.ProfileCache.get(
      "userId" in msgEvtWithMeta ? [msgEvtWithMeta.userId] : [],
    ),
    {},
  )

  const toClient: MsgToClient = {
    t: "event",
    c: msgEvtWithMeta,
    profiles,
  }

  if (spaceState && msgEvtWithMeta.t === "game") {
    return {
      model,
      msgCmd: [
        sendToUser<MsgToClient>(SpaceState.toUserIds(spaceState), toClient),
      ],
    }
  }

  return {
    model,
    msgCmd: [broadcast<MsgToClient>(toClient)],
  }
}

const updateFromSpaceEvent = async ({
  model,
  spaceEvent,
  ctx,
}: {
  ctx: ServerCtx
  model: ModelServer
  spaceEvent: WithEventId<SpaceEvent>
}): Promise<{
  model: ModelServer
  eff?: Eff<MsgServer>
  msgCmd?: ServerCmd<MsgToClient>[]
  spaceEvents?: WithEventId<SpaceEvent>[]
}> => {
  switch (spaceEvent.t) {
    case "user-joined-space": {
      const space = Spaces.toSpace(model, spaceEvent.spaceId)

      if (!space) {
        return { model }
      }

      const started = Space.startFromLatestSnapshot(space)

      return {
        model,
        msgCmd: [
          sendToUser([spaceEvent.userId], {
            t: "synced",
            space: started,
            causedBy: spaceEvent.t,
          }),
        ],
      }
    }

    case "game": {
      const msgEvtWithMeta = Spaces.toEventWithMeta(
        model,
        spaceEvent.spaceId,
        spaceEvent.eventId,
      )

      if (!msgEvtWithMeta) {
        return { model }
      }

      if (msgEvtWithMeta.t !== "game") {
        return { model }
      }

      const spaceState = Spaces.toSpaceStarted(model, msgEvtWithMeta.spaceId)

      if (!spaceState) {
        return { model }
      }

      if (!spaceState.game) {
        return { model }
      }

      const gameUpdated = await Game.update({
        ctx: { ...ctx, space: spaceState },
        model:
          model.games[msgEvtWithMeta.spaceId] ?? Game.init(spaceState.game.t),
        msgSync: { ...msgEvtWithMeta, ...msgEvtWithMeta.c },
        modelSync: spaceState.game,
        deps: null,
      })

      const merged = mergeUpdatedGame({
        gameUpdated,
        model,
        spaceId: msgEvtWithMeta.spaceId,
      })

      return merged
    }

    default: {
      return { model }
    }
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions: ServerModule["subscriptions"] = async ({
  model,
  ctx,
}) => {
  const batch: Sub<MsgServer>[] = []

  for (const spaceId in model.spaces) {
    const spaceState = Spaces.toSpaceStarted(model, spaceId as SpaceId)

    if (!spaceState) {
      continue
    }

    if (!spaceState.game) {
      continue
    }

    const sub = await Game.subscriptions({
      ctx: { ...ctx, space: spaceState },
      model: model.games[spaceId as SpaceId] ?? Game.init(spaceState.game.t),
      modelSync: spaceState.game,
    })

    const mapped = Sub.map(
      sub,
      (c): MsgServer => ({ t: "game", c, spaceId: spaceId as SpaceId }),
    )

    batch.push(mapped)
  }

  return Sub.batch(batch)
}
