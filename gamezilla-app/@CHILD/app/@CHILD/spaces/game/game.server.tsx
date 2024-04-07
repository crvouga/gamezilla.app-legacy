import { Eff, Sub } from "gamezilla-app/@SHARED/core"
import { Game } from "../@CHILD/game/game.server"
import { WithEventId } from "../@SHARED/event"
import { SpaceServerCmd } from "../@SHARED/space-server-cmd"
import { SpaceServerModule } from "../architecture/space-server"
import { SpaceEvent, Spaces } from "../spaces-core"
import { MsgServer } from "../spaces.core"
import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data"

const inputToSpaceId = (input: Parameters<SpaceServerModule["update"]>[0]) => {
  if (input.msg && "spaceId" in input.msg) {
    return input.msg.spaceId
  }

  if (input.msgClient && "spaceId" in input.msgClient) {
    return input.msgClient.spaceId
  }

  if (input.msgSpaceEvent && "spaceId" in input.msgSpaceEvent) {
    return input.msgSpaceEvent.spaceId
  }

  return null
}

const updateGame: SpaceServerModule["update"] = async (input) => {
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

  const msgSpaceEventNew = (gameUpdated.msgSync ?? []).map(
    (e): WithEventId<SpaceEvent> => ({ ...e, spaceId, t: "game", c: e }),
  )

  return {
    model: {
      ...model,
      games: {
        ...model.games,
        [spaceId]: gameUpdated.model,
      },
    },
    eff: Eff.map_((c) => ({ t: "game", c, spaceId }), gameUpdated.eff),
    msgCmd: SpaceServerCmd.map(gameUpdated.msgCmd, (c) => ({
      t: "game",
      c,
      spaceId,
    })),
    msgEvt: [],
    msgSpaceEvent: msgSpaceEventNew,
  }
}

const update: SpaceServerModule["update"] = async (input) => {
  return SpaceServerModule.andThen(
    { model: input.model },
    //
    (model) => updateGame({ ...input, model }),
  )
}

const subscriptions: SpaceServerModule["subscriptions"] = async ({
  model,
  ctx,
}) => {
  const batch: Sub<MsgServer>[] = []

  for (const spaceId_ in model.spaces) {
    const spaceId = spaceId_ as SpaceId
    const spaceState = Spaces.toSpaceStarted(model, spaceId)

    if (!spaceState) {
      continue
    }

    if (!spaceState.game) {
      continue
    }

    const sub = await Game.subscriptions({
      ctx: { ...ctx, space: spaceState },
      model: model.games[spaceId] ?? Game.init(spaceState.game.t),
      modelSync: spaceState.game,
    })

    const mapped = Sub.map(sub, (c): MsgServer => ({ t: "game", c, spaceId }))

    batch.push(mapped)
  }

  return Sub.batch(batch)
}

export const GameServer = {
  subscriptions,
  update,
}
