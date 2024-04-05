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
  return AppServerModule.andThen(
    { model: input.model },
    (model) => updateProfileCache({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromClient({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateChild({ ...input, model }),
  )
}

const updateProfileCache: ServerModule["update"] = async (input) => {
  await input.deps.ProfileCache.add(input.msgClient?.profiles ?? {})

  return { model: input.model }
}

const updateFromMsg: ServerModule["update"] = async ({ model, msg }) => {
  if (!msg) {
    return { model }
  }

  switch (msg.t) {
    case "game": {
      return { model }
    }

    case "event": {
      return { model }
    }
  }
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

    case "list-spaces": {
      const spaces = Spaces.listSpaces({
        model,
        limit: msgClient.limit,
        offset: msgClient.offset,
        where: msgClient.where,
      })

      const profiles = await spacesToProfiles(input.deps, spaces)

      const started = spaces.map((space) =>
        Space.startFromLatestSnapshot(space),
      )

      return {
        model,
        msgCmd: [
          sendBack(msgClient, {
            t: "listed-spaces",
            spaces: started,
            profiles,
            causedBy: msgClient.t,
          }),
        ],
      }
    }

    case "sync": {
      return AppServerModule.andThen(
        { model },
        (model) => {
          const merged = Spaces.mergeOne({
            model,
            space: msgClient.space,
          })

          return {
            model: {
              errors: {},
              games: model.games,
              spaceIdByUserId: merged.spaceIdByUserId,
              spaces: merged.spaces,
            },
          }
        },
        async (model) => {
          const spaceId = Space.toSpaceId(msgClient.space)

          if (!spaceId) {
            return { model }
          }

          const spaceNew = Spaces.toSpace(model, spaceId)

          if (!spaceNew) {
            return { model }
          }

          const profiles = await spacesToProfiles(input.deps, [spaceNew])

          const starting = Space.startFromLatestSnapshot(spaceNew)

          return {
            model,
            msgCmd: [
              sendToClient<MsgToClient>([msgClient.clientId], {
                t: "synced",
                causedBy: msgClient.t,
                space: starting,
                profiles: profiles,
              }),
            ],
          }
        },
      )
    }
    default: {
      return { model }
    }
  }
}

const updateFromEvent: ServerModule["update"] = async (input) => {
  const { msgEvt, model } = input

  if (!msgEvt) {
    return { model }
  }

  switch (msgEvt.t) {
    case "auth/client-authenticated": {
      const space = Spaces.toSpaceByUserId({
        model,
        userId: msgEvt.account.userId,
      })

      if (!space) {
        return { model }
      }

      const profiles = await spacesToProfiles(input.deps, [space])

      const started = Space.startFromLatestSnapshot(space)

      return {
        model,
        msgCmd: [
          sendToClient<MsgToClient>([msgEvt.clientId], {
            t: "current-user-space",
            space: started,
            profiles,
            causedBy: msgEvt.t,
          }),
        ],
      }
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

const updateChild: ServerModule["update"] = async (input) => {
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
