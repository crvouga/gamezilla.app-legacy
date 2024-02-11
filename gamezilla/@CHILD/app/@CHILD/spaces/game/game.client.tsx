import {
  APP_SOUND,
  ClientCmd,
  playSound,
} from "gamezilla/@CHILD/app/@SHARED/client"
import { Eff, Sub } from "gamezilla/@SHARED/core"
import { Game } from "../@CHILD/game/game.client"
import { WithEventId } from "../@SHARED/event"
import { SpaceClientModule } from "../architechure/space-client"
import { Space, SpaceEvent, SpaceState, Spaces } from "../spaces-core"
import { ModelClient, MsgClient } from "../spaces.core"
import { gameNameList, gameNameToString } from "../@CHILD/game/game.core"
import {
  ViewGameHeader,
  ViewUsersInSpaceList,
} from "../@CHILD/game/@SHARED/game"
import { SpaceClientCtx } from "../@SHARED/space"
import { CoverArt } from "../@CHILD/game/game-cover-art"

const update: SpaceClientModule["update"] = (input) => {
  return SpaceClientModule.chainUpdates(
    { model: input.model },
    //
    (model) => updateFromSpaceEvent({ ...input, model }),
    (model) => updateGame({ ...input, model }),
  )
}

const updateFromSpaceEvent: SpaceClientModule["update"] = (input) => {
  const { msgSpaceEvent, model, ctx } = input

  switch (msgSpaceEvent?.t) {
    case "user-inputted-game": {
      if (!ctx.currentUserId) {
        return { model }
      }

      const currentUserSpaceId = Spaces.toSpaceIdByUserId(
        model,
        ctx.currentUserId,
      )

      if (msgSpaceEvent.spaceId === currentUserSpaceId) {
        return {
          model,
          msgCmd: [
            playSound(
              msgSpaceEvent.game
                ? APP_SOUND.navForwardMin
                : APP_SOUND.navBackwardMin,
            ),
          ],
        }
      }
      return { model }
    }

    default: {
      return { model }
    }
  }
}

const inputToSpaceId = (input: Parameters<SpaceClientModule["update"]>[0]) => {
  if (input.msg && "spaceId" in input.msg) {
    return input.msg.spaceId
  }

  if (input.msgServer && "spaceId" in input.msgServer) {
    return input.msgServer.spaceId
  }

  return null
}

const updateGame: SpaceClientModule["update"] = (input) => {
  const { ctx, model, msgServer, msgEvt, msg, msgSpaceEvent } = input

  if (!ctx.currentUserId) {
    return { model }
  }

  const spaceId = inputToSpaceId(input)

  if (!spaceId) {
    return { model }
  }

  const spaceState = Spaces.toSpaceStarted(model, spaceId)

  if (!spaceState) {
    return { model }
  }

  const modelGame = spaceState.game

  if (!modelGame) {
    return { model }
  }

  const msgSpaceEventWithMeta = msgSpaceEvent?.eventId
    ? Spaces.toEventWithMeta(model, spaceId, msgSpaceEvent?.eventId)
    : null

  const gameModel = model.games[spaceId] ?? Game.init(modelGame.t)

  const gameUpdated = Game.update({
    ctx: {
      ...ctx,
      space: spaceState,
      currentUserId: ctx.currentUserId,
      quit() {},
      viewProfile() {},
    },
    model: gameModel,
    msgGame:
      msgSpaceEventWithMeta?.t === "game"
        ? { ...msgSpaceEventWithMeta, ...msgSpaceEventWithMeta.c }
        : null,
    modelGame: modelGame,
    msgServer: msgServer?.t === "game" ? msgServer.c : null,
    msgCmd: null,
    msgEvt,
    msg: msg?.t === "game" ? msg.c : null,
  })

  const msgSpaceEventNew = (gameUpdated.msgGame ?? []).map(
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
    msgCmd: ClientCmd.map(
      gameUpdated.msgCmd ?? [],
      (c) => ({ t: "game", c, spaceId }),
      (c) => ({ t: "game", c, spaceId }),
    ),
    eff: Eff.map_((c) => ({ t: "game", c, spaceId }), gameUpdated.eff),
    msgEvt: [],
    msgSpaceEvent: msgSpaceEventNew,
  }
}

//
//
//
//
//
//
//

const subscriptions: SpaceClientModule["subscriptions"] = (input) => {
  return subscriptionsCurrentUserGame(input)
}

const subscriptionsCurrentUserGame: SpaceClientModule["subscriptions"] = ({
  ctx,
  model,
}) => {
  const { currentUserId } = ctx

  if (!currentUserId) {
    return Sub.None
  }

  const clientCtx = { ...ctx, currentUserId }

  const spaceId = Spaces.toSpaceIdByUserId(model, currentUserId)

  if (!spaceId) {
    return Sub.None
  }

  const spaceModel = model.spaces[spaceId]

  if (!spaceModel) {
    return Sub.None
  }

  const spaceState = Space.toSpaceStarted(spaceModel)

  if (!spaceState) {
    return Sub.None
  }

  const modelGame = spaceState.game

  if (!modelGame) {
    return Sub.None
  }

  const gameModel = model.games[spaceId] ?? Game.init(modelGame.t)

  const gameSub = Game.subscriptions({
    ctx: { ...clientCtx, space: spaceState, quit() {}, viewProfile() {} },
    modelGame: modelGame,
    model: gameModel,
  })

  const sub = Sub.map(gameSub, (c): MsgClient => ({ t: "game", c, spaceId }))

  return sub
}

//
//
//
//
//
//
//

const View = ({
  space,
  model,
  ctx,
  dispatch,
  dispatchEvent,
}: {
  space: SpaceState.Started
  model: ModelClient
  ctx: SpaceClientCtx
  dispatch: (m: MsgClient) => void
  dispatchEvent: (m: SpaceEvent) => void
}) => {
  if (space.game) {
    return (
      <Game.View
        modelGame={space.game}
        ctx={ctx}
        dispatch={(c) => dispatch({ t: "game", spaceId: ctx.space.spaceId, c })}
        model={model.games[ctx.space.spaceId] ?? Game.init(space.game.t)}
      />
    )
  }

  return <ViewScreenNotInGame ctx={ctx} dispatchEvent={dispatchEvent} />
}

export const ViewScreenNotInGame = ({
  ctx,
  dispatchEvent,
}: {
  ctx: SpaceClientCtx
  dispatchEvent: (m: SpaceEvent) => void
}) => {
  if (ctx.space.hostId !== ctx.currentUserId) {
    return (
      <div className="flex h-full w-full flex-1 flex-col">
        <ViewGameHeader />
        <ViewUsersInSpaceList ctx={ctx} />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-4 p-4">
      <h1 className="text-center text-3xl font-bold">Games</h1>

      <div className="grid grid-cols-3 justify-between gap-8">
        {gameNameList.map((gameName) => (
          <div key={gameName}>
            <button
              aria-label={gameName}
              onClick={() =>
                dispatchEvent({
                  t: "user-inputted-game",
                  spaceId: ctx.space.spaceId,
                  userId: ctx.currentUserId,
                  game: gameName,
                })
              }
              className="flex overflow-hidden rounded-lg border border-neutral-600"
            >
              <CoverArt gameName={gameName} />
            </button>

            <p className="mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-semibold">
              {gameNameToString(gameName)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

//
//
//
//
//
//
//

export const GameClient = {
  View,
  update,
  subscriptions,
}
